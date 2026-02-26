import { readdir, readFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'

import { discoverEvals } from './utils/discovery'
import { sanitizeSegment } from './utils/fs'

type RunMode = 'full' | 'generate_only' | 'judge_latest'

type ResultsSummary = {
  runId?: string
  startedAt?: string
  finishedAt?: string
  sourceRun?: string | null
  judgeModel?: string | null
  solverModel?: string | null
  pattern?: string | null
  evalCount?: number
  evalsProcessed?: number
  evalsErrored?: number
  weightedAverageScore?: number
}

type ResultsRunInfo = {
  name: string
  path: string
  hasGenerated: boolean
  generatedEvalCount: number
  evalResultCount: number
  hasSummary: boolean
  summary: ResultsSummary | null
}

type ActiveRunState = {
  id: string
  mode: RunMode
  startedAt: string
  startedAtMs: number
  command: string[]
  sourceRun?: string | null
  proc: Bun.Subprocess
  logs: string[]
  partialStdout: string
  partialStderr: string
  lastProgressLine: string | null
  exitCode: number | null
  completedAt: string | null
}

type RunRequest = {
  mode: RunMode
  judgeModel: string
  generatorModel: string
  sourceRun?: string
  resumeRun?: string
  pattern?: string
  concurrency?: number
  timeout?: number
  port?: number
}

const RESULTS_DIR = path.join(process.cwd(), 'results')
const DEFAULT_MODEL = 'llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M'
const MAX_LOG_LINES = 600
const XDG_ENV = {
  XDG_CONFIG_HOME: '/home/lesio/evals/.opencode-home/.config',
  XDG_DATA_HOME: '/home/lesio/evals/.opencode-home/.local/share',
  XDG_CACHE_HOME: '/home/lesio/evals/.opencode-home/.cache',
  XDG_STATE_HOME: '/home/lesio/evals/.opencode-home/.local/state',
}

function isOpenAiModel(model: string) {
  return model.trim().toLowerCase().startsWith('openai/')
}

function runUsesOpenAiModels(mode: RunMode, judgeModel: string, generatorModel: string) {
  if (mode === 'judge_latest') {
    return isOpenAiModel(judgeModel)
  }
  if (mode === 'generate_only') {
    return isOpenAiModel(generatorModel)
  }
  return isOpenAiModel(judgeModel) || isOpenAiModel(generatorModel)
}

function buildSpawnEnvForRun(mode: RunMode, judgeModel: string, generatorModel: string) {
  const env: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => typeof value === 'string')
    ),
    ...XDG_ENV,
  }

  let usedOpenApiKeyAlias = false
  if (!env.OPENAI_API_KEY && env.OPEN_API_KEY) {
    env.OPENAI_API_KEY = env.OPEN_API_KEY
    usedOpenApiKeyAlias = true
  }

  if (runUsesOpenAiModels(mode, judgeModel, generatorModel) && !env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is required for openai/* models. Set OPENAI_API_KEY before starting the Bench UI (OPEN_API_KEY is also accepted as a compatibility alias).'
    )
  }

  return { env, usedOpenApiKeyAlias }
}

let activeRun: ActiveRunState | null = null
let lastFinishedRun: {
  id: string
  mode: RunMode
  startedAt: string
  completedAt: string | null
  exitCode: number | null
  command: string[]
  sourceRun?: string | null
  logsTail: string[]
  lastProgressLine: string | null
} | null = null

function toRelative(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

function nowId() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function isRunning(run: ActiveRunState | null) {
  return Boolean(run && run.exitCode === null)
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.max(min, Math.min(max, Math.floor(parsed)))
}

function shellQuote(value: string) {
  if (/^[a-zA-Z0-9_./:-]+$/.test(value)) {
    return value
  }
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function hasProgressSignature(line: string) {
  return line.includes(' | elapsed ') && line.includes(' | eta ') && line.includes(' it/s')
}

function pushLog(run: ActiveRunState, chunk: string, stream: 'stdout' | 'stderr') {
  const partialKey = stream === 'stdout' ? 'partialStdout' : 'partialStderr'
  let buffer = run[partialKey] + chunk
  const lines = buffer.split(/\r?\n/)
  run[partialKey] = lines.pop() ?? ''

  for (const line of lines) {
    const normalized = line.trimEnd()
    if (!normalized) {
      continue
    }
    run.logs.push(normalized)
    if (hasProgressSignature(normalized)) {
      run.lastProgressLine = normalized
    }
  }

  if (run.logs.length > MAX_LOG_LINES) {
    run.logs.splice(0, run.logs.length - MAX_LOG_LINES)
  }
}

async function pumpStream(
  run: ActiveRunState,
  stream: ReadableStream<Uint8Array> | null,
  kind: 'stdout' | 'stderr'
) {
  if (!stream) {
    return
  }

  const reader = stream.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      if (!value) {
        continue
      }
      pushLog(run, decoder.decode(value, { stream: true }), kind)
    }
    const flush = decoder.decode()
    if (flush) {
      pushLog(run, flush, kind)
    }
  } finally {
    const partialKey = kind === 'stdout' ? 'partialStdout' : 'partialStderr'
    const tail = run[partialKey].trim()
    if (tail) {
      run.logs.push(tail)
      if (hasProgressSignature(tail)) {
        run.lastProgressLine = tail
      }
      run[partialKey] = ''
      if (run.logs.length > MAX_LOG_LINES) {
        run.logs.splice(0, run.logs.length - MAX_LOG_LINES)
      }
    }
  }
}

async function readSummary(summaryPath: string): Promise<ResultsSummary | null> {
  try {
    const raw = await readFile(summaryPath, 'utf8')
    return JSON.parse(raw) as ResultsSummary
  } catch {
    return null
  }
}

async function listGeneratedEvalDirectories(runDir: string): Promise<string[]> {
  try {
    const entries = await readdir(path.join(runDir, 'generated'), {
      withFileTypes: true,
    })
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  } catch {
    return []
  }
}

async function countEvalResultFiles(runDir: string): Promise<number> {
  try {
    const entries = await readdir(path.join(runDir, 'evals'), {
      withFileTypes: true,
    })
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).length
  } catch {
    return 0
  }
}

async function listResultsRuns(): Promise<ResultsRunInfo[]> {
  try {
    const entries = await readdir(RESULTS_DIR, { withFileTypes: true })
    const dirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a))

    const runs = await Promise.all(
      dirs.map(async (name) => {
        const runDir = path.join(RESULTS_DIR, name)
        const summaryPath = path.join(runDir, 'summary.json')
        const summary = await readSummary(summaryPath)
        const generatedEvalDirs = await listGeneratedEvalDirectories(runDir)
        const generatedEvalCount = generatedEvalDirs.length
        const hasGenerated = generatedEvalCount > 0
        const evalResultCount = await countEvalResultFiles(runDir)

        return {
          name,
          path: toRelative(runDir),
          hasGenerated,
          generatedEvalCount,
          evalResultCount,
          hasSummary: summary !== null,
          summary,
        } satisfies ResultsRunInfo
      })
    )

    return runs
  } catch {
    return []
  }
}

async function getLatestGeneratedRun(): Promise<ResultsRunInfo | null> {
  const runs = await listResultsRuns()
  return runs.find((run) => run.hasGenerated) ?? null
}

async function getJudgeSourcePreview(sourceRunRelativePath: string, pattern: string) {
  const sourceRunDir = path.resolve(process.cwd(), sourceRunRelativePath)
  const generatedEvalDirs = await listGeneratedEvalDirectories(sourceRunDir)
  const generatedEvalDirSet = new Set(generatedEvalDirs)
  const discoveredEvals = await discoverEvals(pattern)

  let readyToJudgeCount = 0

  for (const evalItem of discoveredEvals) {
    const generatedDirName = sanitizeSegment(evalItem.evalId)
    if (generatedEvalDirSet.has(generatedDirName)) {
      readyToJudgeCount += 1
    }
  }

  return {
    sourceRun: toRelative(sourceRunDir),
    pattern,
    generatedEvalCount: generatedEvalDirs.length,
    patternEvalCount: discoveredEvals.length,
    readyToJudgeCount,
    missingGeneratedCount: Math.max(0, discoveredEvals.length - readyToJudgeCount),
  }
}

async function canBindPort(port: number, host = '127.0.0.1') {
  return await new Promise<boolean>((resolve) => {
    const server = net.createServer()
    server.unref()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen({
      port,
      host,
      exclusive: true,
    })
  })
}

async function chooseAvailablePort(preferredPort: number, attempts = 20) {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = preferredPort + offset
    if (candidate > 65535) {
      break
    }

    if (await canBindPort(candidate)) {
      return candidate
    }
  }

  throw new Error(
    `Could not find a free OpenCode port starting from ${preferredPort} (checked ${attempts} ports)`
  )
}

function buildCommandFromRequest(
  request: RunRequest,
  allRuns: ResultsRunInfo[]
) {
  const mode = request.mode
  const judgeModel = request.judgeModel.trim()
  const generatorModel = request.generatorModel.trim()
  const selectedSourceRun = request.sourceRun?.trim() || ''
  const selectedResumeRun = request.resumeRun?.trim() || ''
  const pattern = (request.pattern?.trim() || 'evals/**/*')
  const concurrency = normalizeNumber(request.concurrency, 2, 1, 32)
  const timeout = normalizeNumber(request.timeout, 120000, 1000, 60 * 60 * 1000)
  const port = normalizeNumber(request.port, 4103, 1, 65535)
  const generatedRuns = allRuns.filter((run) => run.hasGenerated)
  const latestGeneratedRun = generatedRuns[0] ?? null

  if ((mode === 'full' || mode === 'judge_latest') && !judgeModel) {
    throw new Error('Judge model is required')
  }
  if ((mode === 'full' || mode === 'generate_only') && !generatorModel) {
    throw new Error('Generator model is required')
  }

  if (mode === 'judge_latest' && !latestGeneratedRun) {
    throw new Error('No generated results found in results/ to re-judge')
  }

  const baseIndexArgs = ['runner/index.ts', '--pattern', pattern, '--concurrency', String(concurrency), '--timeout', String(timeout), '--port', String(port)]
  let args: string[]
  let sourceRun: string | null = null
  let resumeRun: string | null = null

  if (mode === 'full') {
    args = [
      ...baseIndexArgs,
      '--model',
      judgeModel,
      '--solver-model',
      generatorModel,
    ]
  } else if (mode === 'generate_only') {
    args = [
      ...baseIndexArgs,
      '--solver-model',
      generatorModel,
    ]
  } else {
    const chosen =
      selectedSourceRun.length > 0
        ? generatedRuns.find((run) => run.path === selectedSourceRun) ?? null
        : latestGeneratedRun

    if (!chosen) {
      throw new Error(
        selectedSourceRun.length > 0
          ? `Selected source run not found or has no generated files: ${selectedSourceRun}`
          : 'No generated results found in results/ to re-judge'
      )
    }

    sourceRun = chosen.path
    if (selectedResumeRun.length > 0) {
      const chosenResumeRun =
        allRuns.find((run) => run.path === selectedResumeRun) ?? null
      if (!chosenResumeRun) {
        throw new Error(`Selected resume run not found: ${selectedResumeRun}`)
      }
      if (chosenResumeRun.evalResultCount <= 0) {
        throw new Error(`Selected resume run has no saved eval results: ${selectedResumeRun}`)
      }
      resumeRun = chosenResumeRun.path
    }

    args = [
      'runner/judge-existing-run.ts',
      '--source-run',
      sourceRun,
      '--pattern',
      pattern,
      '--model',
      judgeModel,
      '--concurrency',
      String(concurrency),
      '--timeout',
      String(timeout),
      '--port',
      String(port),
    ]
    if (resumeRun) {
      args.push('--resume-run', resumeRun)
    }
  }

  return {
    args,
    sourceRun,
    resumeRun,
    normalized: {
      mode,
      judgeModel,
      generatorModel,
      pattern,
      concurrency,
      timeout,
      port,
    },
  }
}

async function spawnRun(
  request: RunRequest,
  allRuns: ResultsRunInfo[]
) {
  if (isRunning(activeRun)) {
    throw new Error('A benchmark is already running')
  }

  const initialBuild = buildCommandFromRequest(request, allRuns)
  const requestedPort = initialBuild.normalized.port
  const chosenPort = await chooseAvailablePort(requestedPort)
  const built =
    chosenPort === requestedPort
      ? initialBuild
      : buildCommandFromRequest(
          {
            ...request,
            port: chosenPort,
          },
          allRuns
        )
  const bunBin = process.execPath || '/home/lesio/.bun/bin/bun'
  const command = [bunBin, ...built.args]
  const { env, usedOpenApiKeyAlias } = buildSpawnEnvForRun(
    built.normalized.mode,
    built.normalized.judgeModel,
    built.normalized.generatorModel
  )

  const proc = Bun.spawn({
    cmd: command,
    cwd: process.cwd(),
    env,
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const run: ActiveRunState = {
    id: nowId(),
    mode: built.normalized.mode,
    startedAt: new Date().toISOString(),
    startedAtMs: Date.now(),
    command,
    sourceRun: built.sourceRun,
    proc,
    logs: [],
    partialStdout: '',
    partialStderr: '',
    lastProgressLine: null,
    exitCode: null,
    completedAt: null,
  }

  activeRun = run
  run.logs.push(`starting command: ${command.map(shellQuote).join(' ')}`)
  if (chosenPort !== requestedPort) {
    run.logs.push(
      `requested OpenCode port ${requestedPort} was busy, auto-selected ${chosenPort}`
    )
  }
  if (run.sourceRun) {
    run.logs.push(`judge-only source run: ${run.sourceRun}`)
  }
  if (built.resumeRun) {
    run.logs.push(`judge-only resume run: ${built.resumeRun}`)
  }
  if (usedOpenApiKeyAlias) {
    run.logs.push(
      'using OPEN_API_KEY as compatibility alias for OPENAI_API_KEY'
    )
  }

  void pumpStream(run, proc.stdout, 'stdout')
  void pumpStream(run, proc.stderr, 'stderr')

  void (async () => {
    const exitCode = await proc.exited
    run.exitCode = exitCode
    run.completedAt = new Date().toISOString()
    run.logs.push(`process exited with code ${exitCode}`)
    if (run.logs.length > MAX_LOG_LINES) {
      run.logs.splice(0, run.logs.length - MAX_LOG_LINES)
    }

    lastFinishedRun = {
      id: run.id,
      mode: run.mode,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      exitCode: run.exitCode,
      command: run.command,
      sourceRun: run.sourceRun,
      logsTail: [...run.logs],
      lastProgressLine: run.lastProgressLine,
    }
    activeRun = null
  })()

  return run
}

function stopActiveRun() {
  if (!activeRun || activeRun.exitCode !== null) {
    return false
  }

  try {
    activeRun.proc.kill('SIGINT')
  } catch {
    try {
      activeRun.proc.kill()
    } catch {
      return false
    }
  }
  return true
}

async function getUiState() {
  const runs = await listResultsRuns()
  const latestGeneratedRun = runs.find((run) => run.hasGenerated) ?? null
  const latestSummaryRun = runs.find((run) => run.hasSummary) ?? null
  const current = activeRun

  return {
    cwd: process.cwd(),
    defaults: {
      judgeModel:
        (latestSummaryRun?.summary?.judgeModel ?? DEFAULT_MODEL) || DEFAULT_MODEL,
      generatorModel:
        (latestSummaryRun?.summary?.solverModel ?? DEFAULT_MODEL) || DEFAULT_MODEL,
      pattern: latestSummaryRun?.summary?.pattern ?? 'evals/**/*',
      concurrency: 2,
      timeout: 120000,
      port: 4103,
      mode: 'full' as const,
      sourceRun: latestGeneratedRun?.path ?? '',
    },
    latestGeneratedRun,
    generatedRuns: runs.filter((run) => run.hasGenerated),
    resumeRuns: runs.filter((run) => run.evalResultCount > 0),
    recentRuns: runs.slice(0, 12),
    activeRun: current
      ? {
          id: current.id,
          mode: current.mode,
          startedAt: current.startedAt,
          elapsedMs: Date.now() - current.startedAtMs,
          command: current.command,
          sourceRun: current.sourceRun,
          logs: current.logs,
          lastProgressLine: current.lastProgressLine,
          exitCode: current.exitCode,
          completedAt: current.completedAt,
        }
      : null,
    lastFinishedRun,
  }
}

function htmlPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Benchmark Runner UI</title>
  <style>
    :root {
      --bg: #0d1217;
      --bg2: #131b22;
      --panel: rgba(21, 30, 39, 0.88);
      --panel2: rgba(13, 20, 26, 0.9);
      --line: rgba(164, 196, 214, 0.16);
      --text: #e9f2f7;
      --muted: #9bb2c2;
      --accent: #62d4a8;
      --accent2: #7bc7ff;
      --warn: #ffd17a;
      --danger: #ff8d8d;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--text);
      font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      background:
        radial-gradient(1200px 700px at 110% -10%, rgba(123, 199, 255, 0.15), transparent 60%),
        radial-gradient(900px 600px at -10% 110%, rgba(98, 212, 168, 0.12), transparent 60%),
        linear-gradient(180deg, #0b1116 0%, #0d1217 50%, #0a0f13 100%);
      min-height: 100vh;
    }
    .wrap {
      width: min(1200px, calc(100vw - 24px));
      margin: 18px auto;
      display: grid;
      grid-template-columns: 1.05fr 1.4fr;
      gap: 14px;
    }
    .card {
      background: linear-gradient(180deg, var(--panel), var(--panel2));
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .card h2 {
      margin: 0;
      padding: 14px 16px 10px;
      font-family: "IBM Plex Mono", "SFMono-Regular", ui-monospace, monospace;
      font-size: 14px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      border-bottom: 1px solid var(--line);
    }
    .body { padding: 14px 16px; }
    .grid { display: grid; gap: 12px; }
    .grid.two { grid-template-columns: 1fr 1fr; }
    .field { display: grid; gap: 6px; }
    label {
      font-size: 12px;
      color: var(--muted);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    .hint {
      font-size: 11px;
      color: var(--muted);
      opacity: 0.85;
    }
    input, select, button, textarea {
      font: inherit;
      color: var(--text);
      background: rgba(10, 16, 21, 0.75);
      border: 1px solid rgba(164, 196, 214, 0.18);
      border-radius: 10px;
      padding: 10px 12px;
    }
    input:focus, select:focus, button:focus, textarea:focus {
      outline: 2px solid rgba(123, 199, 255, 0.3);
      outline-offset: 1px;
      border-color: rgba(123, 199, 255, 0.45);
    }
    button {
      cursor: pointer;
      font-weight: 600;
    }
    .btns {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .btn-primary {
      background: linear-gradient(180deg, rgba(98, 212, 168, 0.2), rgba(98, 212, 168, 0.12));
      border-color: rgba(98, 212, 168, 0.35);
    }
    .btn-danger {
      background: linear-gradient(180deg, rgba(255, 141, 141, 0.2), rgba(255, 141, 141, 0.12));
      border-color: rgba(255, 141, 141, 0.35);
    }
    .status {
      display: grid;
      gap: 8px;
      font-size: 13px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(7, 13, 18, 0.55);
      width: fit-content;
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 12px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--muted);
      box-shadow: 0 0 0 4px rgba(255,255,255,0.03);
    }
    .dot.run { background: var(--accent); }
    .dot.stop { background: var(--danger); }
    .kv {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 6px 10px;
      font-size: 13px;
      align-items: start;
    }
    .kv div:nth-child(odd) {
      color: var(--muted);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    .code {
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 12px;
      background: rgba(8, 13, 17, 0.65);
      border: 1px solid rgba(164, 196, 214, 0.12);
      border-radius: 10px;
      padding: 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .logs {
      height: 420px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.35;
      background: rgba(7, 12, 16, 0.92);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      padding: 12px 14px;
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 12px;
    }
    .subtle {
      color: var(--muted);
      font-size: 12px;
    }
    .runs {
      display: grid;
      gap: 8px;
      max-height: 260px;
      overflow: auto;
    }
    .run-item {
      border: 1px solid rgba(164, 196, 214, 0.12);
      background: rgba(8, 13, 17, 0.5);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 4px;
      font-size: 12px;
    }
    .run-top {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    .badge {
      border: 1px solid rgba(164, 196, 214, 0.16);
      border-radius: 999px;
      padding: 2px 8px;
      color: var(--muted);
      font-size: 11px;
    }
    .row-note {
      color: var(--muted);
      font-size: 12px;
      margin-top: -4px;
    }
    .progress-panel {
      border: 1px solid rgba(123, 199, 255, 0.2);
      background: rgba(8, 14, 19, 0.65);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 8px;
    }
    .progress-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 12px;
    }
    .progress-track {
      width: 100%;
      height: 9px;
      background: rgba(164, 196, 214, 0.1);
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid rgba(164, 196, 214, 0.14);
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, rgba(98, 212, 168, 0.9), rgba(123, 199, 255, 0.9));
      transition: width 180ms ease;
    }
    .progress-meta {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 4px 10px;
      font-size: 12px;
    }
    .progress-meta div:nth-child(odd) {
      color: var(--muted);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    .help-box {
      border: 1px solid rgba(164, 196, 214, 0.14);
      background: rgba(8, 13, 17, 0.55);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 6px;
      font-size: 12px;
    }
    .help-box code {
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    .judge-preview {
      border: 1px solid rgba(255, 209, 122, 0.18);
      background: rgba(24, 18, 8, 0.35);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 6px;
      font-size: 12px;
    }
    .judge-preview .title {
      color: var(--warn);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .judge-preview-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 4px 10px;
    }
    .judge-preview-grid div:nth-child(odd) {
      color: var(--muted);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    @media (max-width: 980px) {
      .wrap { grid-template-columns: 1fr; }
      .grid.two { grid-template-columns: 1fr; }
      .logs { height: 320px; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { scroll-behavior: auto; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="card">
      <h2>Run Control</h2>
      <div class="body grid">
        <div class="field">
          <label for="mode">Mode</label>
          <select id="mode">
            <option value="full">Full (Generate + Judge)</option>
            <option value="generate_only">Generate Only</option>
            <option value="judge_latest">Judge Only (Select Source Run)</option>
          </select>
          <div class="hint">Use <code>judge_latest</code> to reuse generated files from an existing results run (defaults to latest generated run) and compute judge results only.</div>
        </div>

        <div id="judgeSourceRow" class="field">
          <label for="sourceRun">Judge Source Run (generated files)</label>
          <select id="sourceRun"></select>
          <div class="hint">Used only in <code>Judge Only</code>. Pick the results run whose <code>generated/</code> folder contains the evals you want to judge.</div>

          <label for="resumeRun">Resume Judge Output Run (optional)</label>
          <select id="resumeRun"></select>
          <div class="hint">Optional. Select an existing judge-only output run in <code>results/</code> to continue and skip already judged evals. Leave as <code>Create new run</code> to start fresh.</div>

          <div id="judgePreview" class="judge-preview">
            <div class="title">Judge-Only Readiness</div>
            <div id="judgePreviewContent" class="judge-preview-grid">
              <div>Source Generated</div><div>n/a</div>
              <div>Pattern Evals</div><div>n/a</div>
              <div>Ready to Judge</div><div>n/a</div>
              <div>Missing Generated</div><div>n/a</div>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="generatorModel">Generator Model</label>
          <input id="generatorModel" type="text" placeholder="llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" />
          <div class="hint">This model generates code (maps to <code>--solver-model</code>).</div>
        </div>

        <div class="field">
          <label for="judgeModel">Judge Model</label>
          <input id="judgeModel" type="text" placeholder="llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" />
          <div class="hint">This model evaluates generated code (maps to <code>--model</code>).</div>
        </div>

        <div class="grid two">
          <div class="field">
            <label for="pattern">Pattern</label>
            <input id="pattern" type="text" placeholder="evals/**/*" />
            <div class="help-box">
              <div><strong>Pattern help</strong></div>
              <div>Pattern is a glob filter for eval folders (same as <code>--pattern</code>).</div>
              <div>Examples: <code>evals/**/*</code>, <code>evals/animation/*</code>, <code>evals/animation/01*</code></div>
              <div>Judge-only tip: the selected source run must have matching files under <code>results/&lt;run&gt;/generated/&lt;evalId&gt;/</code>, otherwise you’ll get “no generated files found”.</div>
            </div>
          </div>
          <div class="field">
            <label for="concurrency">Concurrency</label>
            <input id="concurrency" type="number" min="1" max="32" />
            <div class="hint">How many evals run in parallel. Higher is faster, but increases CPU/RAM/VRAM usage and can make local model runs less stable. Start with <code>1-2</code> for local <code>llama-server</code>.</div>
          </div>
        </div>

        <div class="grid two">
          <div class="field">
            <label for="timeout">Timeout (ms)</label>
            <input id="timeout" type="number" min="1000" step="1000" />
          </div>
          <div class="field">
            <label for="port">OpenCode Port</label>
            <input id="port" type="number" min="1" max="65535" />
            <div class="hint">If busy, the UI auto-picks the next free port.</div>
          </div>
        </div>

        <div class="btns">
          <button id="runBtn" class="btn-primary">Run</button>
          <button id="stopBtn" class="btn-danger">Stop</button>
          <span class="subtle" id="runMsg">Idle</span>
        </div>
      </div>

      <h2>Current Status</h2>
      <div class="body status">
        <div id="statusPill" class="pill"><span class="dot stop"></span><span>idle</span></div>
        <div class="progress-panel">
          <div class="progress-top">
            <span id="progressLabel">Progress not started</span>
            <span id="progressEtaLabel" class="subtle">ETA n/a</span>
          </div>
          <div class="progress-track" aria-hidden="true">
            <div id="progressFill" class="progress-fill"></div>
          </div>
          <div id="progressMeta" class="progress-meta">
            <div>Elapsed</div><div>n/a</div>
            <div>ETA</div><div>n/a</div>
            <div>Rate</div><div>n/a</div>
            <div>Last Eval</div><div>n/a</div>
          </div>
        </div>
        <div id="currentProgress" class="code">No active run</div>
        <div id="currentCmd" class="code">Command preview will appear here</div>
      </div>
    </section>

    <section class="card">
      <h2>Live Logs</h2>
      <div id="logs" class="logs">No logs yet.</div>
      <div class="body">
        <div class="row-note">Logs include the tqdm-style progress/ETA lines from the runner.</div>
      </div>
    </section>

    <section class="card">
      <h2>Latest Generated Data</h2>
      <div class="body">
        <div id="latestRunInfo" class="kv"></div>
      </div>
    </section>

    <section class="card">
      <h2>Recent Results</h2>
      <div id="recentRuns" class="body runs"></div>
    </section>
  </div>

  <script>
    const el = {
      mode: document.getElementById('mode'),
      generatorModel: document.getElementById('generatorModel'),
      judgeModel: document.getElementById('judgeModel'),
      sourceRun: document.getElementById('sourceRun'),
      resumeRun: document.getElementById('resumeRun'),
      judgeSourceRow: document.getElementById('judgeSourceRow'),
      judgePreview: document.getElementById('judgePreview'),
      judgePreviewContent: document.getElementById('judgePreviewContent'),
      pattern: document.getElementById('pattern'),
      concurrency: document.getElementById('concurrency'),
      timeout: document.getElementById('timeout'),
      port: document.getElementById('port'),
      runBtn: document.getElementById('runBtn'),
      stopBtn: document.getElementById('stopBtn'),
      runMsg: document.getElementById('runMsg'),
      statusPill: document.getElementById('statusPill'),
      progressLabel: document.getElementById('progressLabel'),
      progressEtaLabel: document.getElementById('progressEtaLabel'),
      progressFill: document.getElementById('progressFill'),
      progressMeta: document.getElementById('progressMeta'),
      currentProgress: document.getElementById('currentProgress'),
      currentCmd: document.getElementById('currentCmd'),
      logs: document.getElementById('logs'),
      latestRunInfo: document.getElementById('latestRunInfo'),
      recentRuns: document.getElementById('recentRuns'),
    };

    let latestState = null;
    let pollId = null;
    let judgePreviewReqSeq = 0;
    let lastJudgePreviewKey = null;
    let pendingJudgePreviewKey = null;

    function esc(value) {
      return String(value ?? '').replace(/[&<>"]/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
      })[c]);
    }

    function shellQuote(value) {
      if (/^[a-zA-Z0-9_./:-]+$/.test(value)) return value;
      return "'" + String(value).replace(/'/g, "'\\\\''") + "'";
    }

    function optionsSignature(options) {
      return options.map((opt) => String(opt.value) + '\\u0000' + String(opt.label)).join('\\u0001');
    }

    function parseProgressLine(line) {
      if (!line || typeof line !== 'string') return null;
      const parts = line.split(' | ').map((p) => p.trim()).filter(Boolean);
      if (parts.length < 3) return null;

      const head = parts[0];
      const m = head.match(/^\\[([#-]+)\\]\\s+(\\d+)\\/(\\d+)\\s+\\(([\\d.]+)%\\)$/);
      if (!m) return null;

      const parsed = {
        bar: m[1],
        completed: Number(m[2]),
        total: Number(m[3]),
        percent: Number(m[4]),
        elapsed: null,
        eta: null,
        avg: null,
        rate: null,
        llm: null,
        error: false,
        evalId: parts[parts.length - 1] || null,
      };

      for (let i = 1; i < parts.length - 1; i += 1) {
        const p = parts[i];
        if (p.startsWith('elapsed ')) parsed.elapsed = p.slice('elapsed '.length);
        else if (p.startsWith('eta ')) parsed.eta = p.slice('eta '.length);
        else if (p.endsWith('/it')) parsed.avg = p;
        else if (p.endsWith('it/s')) parsed.rate = p;
        else if (p.startsWith('llm:')) parsed.llm = p;
        else if (p === 'ERROR') parsed.error = true;
      }

      return parsed;
    }

    function renderProgressPanel(progressLine, isActive) {
      const parsed = parseProgressLine(progressLine);
      if (!parsed) {
        el.progressFill.style.width = '0%';
        el.progressLabel.textContent = isActive
          ? 'Waiting for first completed eval (ETA appears after first result)'
          : 'Progress not started';
        el.progressEtaLabel.textContent = isActive ? 'ETA pending' : 'ETA n/a';
        el.progressMeta.innerHTML = [
          '<div>Elapsed</div><div>' + (isActive ? 'running…' : 'n/a') + '</div>',
          '<div>ETA</div><div>' + (isActive ? 'pending first completion' : 'n/a') + '</div>',
          '<div>Rate</div><div>n/a</div>',
          '<div>Last Eval</div><div>n/a</div>',
        ].join('');
        return;
      }

      el.progressFill.style.width = String(Math.max(0, Math.min(100, parsed.percent))) + '%';
      el.progressLabel.textContent =
        parsed.completed + '/' + parsed.total + ' (' + parsed.percent.toFixed(1) + '%)' +
        (parsed.llm ? ' • ' + parsed.llm : '') +
        (parsed.error ? ' • ERROR' : '');
      el.progressEtaLabel.textContent = 'ETA ' + (parsed.eta || 'n/a');
      el.progressMeta.innerHTML = [
        '<div>Elapsed</div><div>' + esc(parsed.elapsed || 'n/a') + '</div>',
        '<div>ETA</div><div>' + esc(parsed.eta || 'n/a') + '</div>',
        '<div>Rate</div><div>' + esc(((parsed.avg ? parsed.avg + ' • ' : '') + (parsed.rate || 'n/a'))) + '</div>',
        '<div>Last Eval</div><div><code>' + esc(parsed.evalId || 'n/a') + '</code></div>',
      ].join('');
    }

    function syncModeHints() {
      const mode = el.mode.value;
      const generatorDisabled = mode === 'judge_latest';
      const judgeDisabled = mode === 'generate_only';
      el.generatorModel.disabled = generatorDisabled;
      el.judgeModel.disabled = judgeDisabled;
      el.judgeSourceRow.style.display = mode === 'judge_latest' ? 'grid' : 'none';
      if (el.judgePreview) {
        el.judgePreview.style.display = mode === 'judge_latest' ? 'grid' : 'none';
      }
    }

    function renderSourceRunOptions(state) {
      const runs = (state.generatedRuns || []);
      const currentValue = el.sourceRun.value;
      const latestValue = (state.latestGeneratedRun && state.latestGeneratedRun.path) || '';
      const options = runs.map((run) => {
        const s = run.summary || {};
        const solver = s.solverModel || 'unknown';
        const pat = s.pattern || 'n/a';
        return {
          value: run.path,
          label: run.name + ' | generated=' + run.generatedEvalCount + ' | solver=' + solver + ' | pattern=' + pat,
        };
      });

      if (options.length === 0) {
        if (el.sourceRun.dataset.optionsSig !== '__empty__') {
          el.sourceRun.innerHTML = '<option value="">No generated runs available</option>';
          el.sourceRun.dataset.optionsSig = '__empty__';
        }
        el.sourceRun.disabled = true;
        return;
      }

      const nextSig = optionsSignature(options);
      const shouldRebuild = el.sourceRun.dataset.optionsSig !== nextSig;
      el.sourceRun.disabled = false;
      if (shouldRebuild) {
        el.sourceRun.innerHTML = options
          .map((opt) => '<option value="' + esc(opt.value) + '">' + esc(opt.label) + '</option>')
          .join('');
        el.sourceRun.dataset.optionsSig = nextSig;
      }

      const nextValue =
        options.some((opt) => opt.value === currentValue) ? currentValue :
        options.some((opt) => opt.value === latestValue) ? latestValue :
        options[0].value;
      el.sourceRun.value = nextValue;
    }

    function renderResumeRunOptions(state) {
      const runs = (state.resumeRuns || []);
      const currentValue = el.resumeRun.value;
      const baseOptions = [
        { value: '', label: 'Create new run (no resume)' },
      ];

      const dynamicOptions = runs.map((run) => {
        const s = run.summary || {};
        const source = s.sourceRun || 'unknown';
        const judge = s.judgeModel || 'unknown';
        const pat = s.pattern || 'n/a';
        return {
          value: run.path,
          label:
            run.name +
            ' | judged=' +
            run.evalResultCount +
            ' | judge=' +
            judge +
            ' | source=' +
            source +
            ' | pattern=' +
            pat,
        };
      });

      const options = baseOptions.concat(dynamicOptions);
      const nextSig = optionsSignature(options);
      const shouldRebuild = el.resumeRun.dataset.optionsSig !== nextSig;
      if (shouldRebuild) {
        el.resumeRun.innerHTML = options
          .map((opt) => '<option value="' + esc(opt.value) + '">' + esc(opt.label) + '</option>')
          .join('');
        el.resumeRun.dataset.optionsSig = nextSig;
      }

      if (options.some((opt) => opt.value === currentValue)) {
        el.resumeRun.value = currentValue;
      } else {
        el.resumeRun.value = '';
      }
    }

    function renderJudgePreview(preview, loading, errorText) {
      if (errorText) {
        el.judgePreviewContent.innerHTML = [
          '<div>Status</div><div style="color:#ff8d8d">' + esc(errorText) + '</div>',
          '<div>Source Generated</div><div>n/a</div>',
          '<div>Pattern Evals</div><div>n/a</div>',
          '<div>Ready to Judge</div><div>n/a</div>',
          '<div>Missing Generated</div><div>n/a</div>',
        ].join('');
        return;
      }

      if (loading) {
        el.judgePreviewContent.innerHTML = [
          '<div>Status</div><div>Loading preview…</div>',
          '<div>Source Generated</div><div>n/a</div>',
          '<div>Pattern Evals</div><div>n/a</div>',
          '<div>Ready to Judge</div><div>n/a</div>',
          '<div>Missing Generated</div><div>n/a</div>',
        ].join('');
        return;
      }

      if (!preview) {
        el.judgePreviewContent.innerHTML = [
          '<div>Status</div><div>n/a</div>',
          '<div>Source Generated</div><div>n/a</div>',
          '<div>Pattern Evals</div><div>n/a</div>',
          '<div>Ready to Judge</div><div>n/a</div>',
          '<div>Missing Generated</div><div>n/a</div>',
        ].join('');
        return;
      }

      el.judgePreviewContent.innerHTML = [
        '<div>Source Generated</div><div>' + esc(preview.generatedEvalCount) + '</div>',
        '<div>Pattern Evals</div><div>' + esc(preview.patternEvalCount) + '</div>',
        '<div>Ready to Judge</div><div><strong>' + esc(preview.readyToJudgeCount) + '</strong></div>',
        '<div>Missing Generated</div><div>' + esc(preview.missingGeneratedCount) + '</div>',
      ].join('');
    }

    async function refreshJudgePreview(force = false) {
      if (el.mode.value !== 'judge_latest') {
        if (lastJudgePreviewKey !== null || pendingJudgePreviewKey !== null) {
          renderJudgePreview(null, false, '');
        }
        lastJudgePreviewKey = null;
        pendingJudgePreviewKey = null;
        return;
      }

      const sourceRun = (el.sourceRun.value || '').trim();
      const pattern = (el.pattern.value || '').trim() || 'evals/**/*';
      const previewKey = sourceRun + '|' + pattern;

      if (!sourceRun) {
        lastJudgePreviewKey = null;
        pendingJudgePreviewKey = null;
        renderJudgePreview(null, false, 'No source run selected');
        return;
      }

      if (!force) {
        if (previewKey === lastJudgePreviewKey) {
          return;
        }
        if (previewKey === pendingJudgePreviewKey) {
          return;
        }
      }

      const reqId = ++judgePreviewReqSeq;
      pendingJudgePreviewKey = previewKey;
      renderJudgePreview(null, true, '');

      try {
        const res = await fetch(
          '/api/judge-source-preview?sourceRun=' +
            encodeURIComponent(sourceRun) +
            '&pattern=' +
            encodeURIComponent(pattern)
        );
        const data = await res.json().catch(() => ({}));
        if (reqId !== judgePreviewReqSeq) return;
        pendingJudgePreviewKey = null;
        if (!res.ok) {
          lastJudgePreviewKey = null;
          renderJudgePreview(null, false, data.error || ('Preview failed: ' + res.status));
          return;
        }
        lastJudgePreviewKey = previewKey;
        renderJudgePreview(data, false, '');
      } catch (err) {
        if (reqId !== judgePreviewReqSeq) return;
        pendingJudgePreviewKey = null;
        lastJudgePreviewKey = null;
        renderJudgePreview(
          null,
          false,
          err && err.message ? err.message : String(err)
        );
      }
    }

    function renderLatestRunInfo(run) {
      if (!run) {
        el.latestRunInfo.innerHTML = '<div>No latest generated run found in <code>results/</code>.</div>';
        return;
      }
      const s = run.summary || {};
      el.latestRunInfo.innerHTML = [
        '<div>Path</div><div><code>' + esc(run.path) + '</code></div>',
        '<div>Has Generated</div><div>' + (run.hasGenerated ? 'yes' : 'no') + '</div>',
        '<div>Generated Evals</div><div>' + esc(run.generatedEvalCount) + '</div>',
        '<div>Run ID</div><div>' + esc(s.runId || run.name) + '</div>',
        '<div>Generator (solver)</div><div><code>' + esc(s.solverModel ?? 'unknown') + '</code></div>',
        '<div>Judge</div><div><code>' + esc(s.judgeModel ?? 'none') + '</code></div>',
        '<div>Pattern</div><div><code>' + esc(s.pattern ?? 'n/a') + '</code></div>',
      ].join('');
    }

    function renderRecentRuns(runs) {
      if (!runs || runs.length === 0) {
        el.recentRuns.innerHTML = '<div class="subtle">No runs found.</div>';
        return;
      }
      el.recentRuns.innerHTML = runs.map((run) => {
        const s = run.summary || {};
        const score = typeof s.weightedAverageScore === 'number' ? s.weightedAverageScore : 'n/a';
        return \`
          <div class="run-item">
            <div class="run-top">
              <span>\${esc(run.name)}</span>
              <span class="badge">\${run.hasGenerated ? 'generated' : 'no-generated'}</span>
            </div>
            <div><code>\${esc(run.path)}</code></div>
            <div class="subtle">solver: <code>\${esc(s.solverModel ?? 'none')}</code></div>
            <div class="subtle">judge: <code>\${esc(s.judgeModel ?? 'none')}</code></div>
            <div class="subtle">score: <code>\${esc(score)}</code></div>
          </div>
        \`;
      }).join('');
    }

    function renderState(state) {
      latestState = state;
      syncModeHints();

      if (!el.generatorModel.value) el.generatorModel.value = state.defaults.generatorModel || '';
      if (!el.judgeModel.value) el.judgeModel.value = state.defaults.judgeModel || '';
      if (!el.pattern.value) el.pattern.value = state.defaults.pattern || 'evals/**/*';
      if (!el.concurrency.value) el.concurrency.value = String(state.defaults.concurrency || 2);
      if (!el.timeout.value) el.timeout.value = String(state.defaults.timeout || 120000);
      if (!el.port.value) el.port.value = String(state.defaults.port || 4103);
      if (!el.sourceRun.value && state.defaults.sourceRun) el.sourceRun.value = state.defaults.sourceRun;

      renderSourceRunOptions(state);
      renderResumeRunOptions(state);
      void refreshJudgePreview();
      renderLatestRunInfo(state.latestGeneratedRun);
      renderRecentRuns(state.recentRuns);

      const active = state.activeRun;
      const running = Boolean(active);
      el.runBtn.disabled = running;
      el.stopBtn.disabled = !running;

      if (running) {
        el.statusPill.innerHTML = '<span class="dot run"></span><span>running</span>';
        renderProgressPanel(active.lastProgressLine, true);
        el.currentProgress.textContent = active.lastProgressLine || ('Running... elapsed ' + Math.round((active.elapsedMs || 0) / 1000) + 's');
        el.currentCmd.textContent = (active.command || []).map(shellQuote).join(' ');
        el.logs.textContent = (active.logs || []).join('\\n') || 'Starting...';
      } else {
        el.statusPill.innerHTML = '<span class="dot stop"></span><span>idle</span>';
        const last = state.lastFinishedRun;
        if (last) {
          renderProgressPanel(last.lastProgressLine, false);
          el.currentProgress.textContent = last.lastProgressLine || ('Last run exit code: ' + (last.exitCode ?? 'unknown'));
          el.currentCmd.textContent = (last.command || []).map(shellQuote).join(' ');
          el.logs.textContent = (last.logsTail || []).join('\\n') || 'No logs';
        } else {
          renderProgressPanel(null, false);
          el.currentProgress.textContent = 'No active run';
          el.currentCmd.textContent = 'Command preview will appear here';
          el.logs.textContent = 'No logs yet.';
        }
      }
      el.logs.scrollTop = el.logs.scrollHeight;
      el.runMsg.textContent = running ? 'Benchmark running...' : 'Idle';
    }

    async function fetchState() {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to load state');
      return res.json();
    }

    async function refresh() {
      try {
        const state = await fetchState();
        renderState(state);
      } catch (err) {
        el.runMsg.textContent = 'State error: ' + (err && err.message ? err.message : String(err));
      }
    }

    async function postJson(url, payload) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || ('Request failed: ' + res.status));
      return data;
    }

    el.mode.addEventListener('change', () => {
      syncModeHints();
      void refreshJudgePreview(true);
    });
    el.sourceRun.addEventListener('change', () => {
      void refreshJudgePreview(true);
    });
    el.pattern.addEventListener('change', () => {
      void refreshJudgePreview(true);
    });
    el.pattern.addEventListener('input', () => {
      void refreshJudgePreview(true);
    });

    el.runBtn.addEventListener('click', async () => {
      const payload = {
        mode: el.mode.value,
        judgeModel: el.judgeModel.value.trim(),
        generatorModel: el.generatorModel.value.trim(),
        sourceRun: el.sourceRun.value,
        resumeRun: el.resumeRun.value,
        pattern: el.pattern.value.trim(),
        concurrency: Number(el.concurrency.value),
        timeout: Number(el.timeout.value),
        port: Number(el.port.value),
      };
      el.runMsg.textContent = 'Starting...';
      try {
        await postJson('/api/run', payload);
        await refresh();
      } catch (err) {
        el.runMsg.textContent = 'Run error: ' + (err && err.message ? err.message : String(err));
      }
    });

    el.stopBtn.addEventListener('click', async () => {
      el.runMsg.textContent = 'Stopping...';
      try {
        await postJson('/api/stop', {});
        await refresh();
      } catch (err) {
        el.runMsg.textContent = 'Stop error: ' + (err && err.message ? err.message : String(err));
      }
    });

    pollId = setInterval(refresh, 2000);
    refresh();
  </script>
</body>
</html>`
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

async function handleRequest(req: Request) {
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname === '/') {
    return new Response(htmlPage(), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    return json(await getUiState())
  }

  if (req.method === 'GET' && url.pathname === '/api/judge-source-preview') {
    try {
      const sourceRun = (url.searchParams.get('sourceRun') ?? '').trim()
      const pattern = (url.searchParams.get('pattern') ?? '').trim() || 'evals/**/*'

      if (!sourceRun) {
        return json({ error: 'sourceRun is required' }, 400)
      }

      return json(await getJudgeSourcePreview(sourceRun, pattern))
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : String(error) },
        400
      )
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/run') {
    try {
      const body = (await req.json()) as RunRequest
      const runs = await listResultsRuns()
      const run = await spawnRun(body, runs)
      return json({
        ok: true,
        runId: run.id,
      })
    } catch (error) {
      return json(
        { ok: false, error: error instanceof Error ? error.message : String(error) },
        400
      )
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/stop') {
    const stopped = stopActiveRun()
    return json({ ok: true, stopped })
  }

  return new Response('Not Found', { status: 404 })
}

const port = Number(process.env.BENCH_UI_PORT || 4173)

const server = Bun.serve({
  port,
  hostname: '127.0.0.1',
  fetch: handleRequest,
})

console.log(`benchmark ui listening on http://127.0.0.1:${server.port}`)
