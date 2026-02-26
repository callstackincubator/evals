import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs as parseArgv } from 'node:util'

import { runLlmJudgeStage } from './evaluators/llm/run'
import {
  createRunOutputDirectories,
  writeSummary,
} from './evaluators/llm/output'
import { runWithConcurrency } from './solver/concurrency'
import { discoverEvals } from './utils/discovery'
import { loadFiles, sanitizeSegment } from './utils/fs'
import { createProgressReporter } from './utils/progress'

type SourceRunSummary = {
  runId?: string
  startedAt?: string
  sourceRun?: string | null
  judgeModel?: string | null
  solverModel?: string | null
  pattern?: string | null
}

type PersistedJudgeEvalRequirement = {
  passed?: boolean
}

type PersistedJudgeEvalResult = {
  evalId: string
  judgeModel?: string | null
  solverModel?: string | null
  llmJudgeRequirements?: PersistedJudgeEvalRequirement[]
  score?: {
    ratio?: number
  }
  sourceGeneratedDir?: string
}

function parsePositiveInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${flagName} must be a positive integer`)
  }

  return parsedValue
}

function parseCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'source-run': { type: 'string' },
      'resume-run': { type: 'string' },
      'concurrency': { type: 'string', default: '2' },
      'debug': { type: 'boolean', default: false },
      'fail-fast': { type: 'boolean', default: false },
      'model': { type: 'string' },
      'pattern': { type: 'string', default: 'evals/**/*' },
      'timeout': { type: 'string', default: '120000' },
      'port': { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  })

  if (!values['source-run']) {
    throw new Error('--source-run is required (path to an existing results/<run-id>)')
  }

  if (!values.model) {
    throw new Error('--model is required for judge-only mode')
  }

  return {
    sourceRun: values['source-run'],
    resumeRun: values['resume-run'] ?? undefined,
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    debug: values.debug ?? false,
    failFast: values['fail-fast'] ?? false,
    model: values.model,
    pattern: values.pattern,
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: values.port ? parsePositiveInteger(values.port, '--port') : undefined,
  }
}

function toRelativePath(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

async function tryReadSourceSummary(sourceRunDir: string): Promise<SourceRunSummary | null> {
  try {
    const raw = await readFile(path.join(sourceRunDir, 'summary.json'), 'utf-8')
    return JSON.parse(raw) as SourceRunSummary
  } catch {
    return null
  }
}

async function ensureRunOutputDirectories(runDirectory: string) {
  await mkdir(runDirectory, { recursive: true })

  const evalDirectory = path.join(runDirectory, 'evals')
  await mkdir(evalDirectory, { recursive: true })

  return {
    runDirectory,
    evalDirectory,
  }
}

async function readPersistedJudgeEvalResults(evalDirectory: string) {
  const results = new Map<string, PersistedJudgeEvalResult>()

  try {
    const entries = await readdir(evalDirectory, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue
      }

      const filePath = path.join(evalDirectory, entry.name)
      try {
        const raw = await readFile(filePath, 'utf8')
        const parsed = JSON.parse(raw) as Partial<PersistedJudgeEvalResult>
        if (!parsed || typeof parsed.evalId !== 'string') {
          continue
        }

        results.set(parsed.evalId, parsed as PersistedJudgeEvalResult)
      } catch (error) {
        console.warn(
          `[judge-only][resume] skipping unreadable result file ${toRelativePath(filePath)}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
  } catch {
    return results
  }

  return results
}

function countMetricsFromPersistedResults(
  discoveredEvalIds: string[],
  persistedResults: Map<string, PersistedJudgeEvalResult>
) {
  const persistedSuccessfulResults = discoveredEvalIds
    .map((evalId) => persistedResults.get(evalId) ?? null)
    .filter((result): result is PersistedJudgeEvalResult => {
      return (
        result !== null &&
        Array.isArray(result.llmJudgeRequirements) &&
        typeof result.score?.ratio === 'number'
      )
    })

  const requirementsTotal = persistedSuccessfulResults.reduce((sum, result) => {
    return sum + result.llmJudgeRequirements!.length
  }, 0)

  const requirementsPassed = persistedSuccessfulResults.reduce((sum, result) => {
    return (
      sum +
      result.llmJudgeRequirements!.filter((requirement) => requirement.passed).length
    )
  }, 0)

  const evalsProcessed = persistedSuccessfulResults.length
  const evalsErrored = Math.max(0, discoveredEvalIds.length - evalsProcessed)

  const weightedAverageScore =
    evalsProcessed === 0
      ? 0
      : Math.round(
          (persistedSuccessfulResults.reduce(
            (sum, result) => sum + (result.score?.ratio ?? 0),
            0
          ) /
            evalsProcessed) *
            10000
        ) / 10000

  return {
    evalsProcessed,
    evalsErrored,
    requirementsTotal,
    requirementsPassed,
    weightedAverageScore,
  }
}

function validateResumeRunCompatibility(
  resumeRunDir: string,
  resumeSummary: SourceRunSummary | null,
  sourceRunRelativePath: string,
  cliOptions: ReturnType<typeof parseCliArgs>,
  persistedResults: Map<string, PersistedJudgeEvalResult>
) {
  if (resumeSummary?.sourceRun && resumeSummary.sourceRun !== sourceRunRelativePath) {
    throw new Error(
      `--resume-run sourceRun mismatch: summary has ${resumeSummary.sourceRun}, but current --source-run is ${sourceRunRelativePath}`
    )
  }

  if (
    typeof resumeSummary?.judgeModel === 'string' &&
    resumeSummary.judgeModel !== cliOptions.model
  ) {
    throw new Error(
      `--resume-run judgeModel mismatch: summary has ${resumeSummary.judgeModel}, but current --model is ${cliOptions.model}`
    )
  }

  if (resumeSummary?.pattern && resumeSummary.pattern !== cliOptions.pattern) {
    throw new Error(
      `--resume-run pattern mismatch: summary has ${resumeSummary.pattern}, but current --pattern is ${cliOptions.pattern}`
    )
  }

  const samplePersisted = persistedResults.values().next().value as
    | PersistedJudgeEvalResult
    | undefined
  if (
    samplePersisted &&
    typeof samplePersisted.sourceGeneratedDir !== 'string'
  ) {
    throw new Error(
      `--resume-run ${toRelativePath(resumeRunDir)} does not look like a judge-only run (missing sourceGeneratedDir in eval result files)`
    )
  }
}

async function main() {
  const cliOptions = parseCliArgs()
  const sourceRunDir = path.resolve(process.cwd(), cliOptions.sourceRun)
  const sourceGeneratedDir = path.join(sourceRunDir, 'generated')
  const sourceSummary = await tryReadSourceSummary(sourceRunDir)
  const sourceRunRelativePath = toRelativePath(sourceRunDir)
  const resumeRunDir = cliOptions.resumeRun
    ? path.resolve(process.cwd(), cliOptions.resumeRun)
    : null
  const resumeSummary = resumeRunDir
    ? await tryReadSourceSummary(resumeRunDir)
    : null

  const discoveredEvals = await discoverEvals(cliOptions.pattern)
  const discoveredEvalIds = discoveredEvals.map((evalItem) => evalItem.evalId)
  const discoveredEvalIdSet = new Set(discoveredEvalIds)

  const runId =
    resumeRunDir?.split(path.sep).pop() ??
    new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = resumeSummary?.startedAt ?? new Date().toISOString()
  const outputDirs = resumeRunDir
    ? await ensureRunOutputDirectories(resumeRunDir)
    : await createRunOutputDirectories('results', runId)
  const persistedResultsBeforeAll = await readPersistedJudgeEvalResults(
    outputDirs.evalDirectory
  )

  if (resumeRunDir) {
    validateResumeRunCompatibility(
      resumeRunDir,
      resumeSummary,
      sourceRunRelativePath,
      cliOptions,
      persistedResultsBeforeAll
    )
  }

  const persistedResultsBefore = new Map(
    [...persistedResultsBeforeAll].filter(([evalId]) => discoveredEvalIdSet.has(evalId))
  )
  const pendingEvals = discoveredEvals.filter(
    (evalItem) => !persistedResultsBefore.has(evalItem.evalId)
  )

  console.log(`starting judge-only run from generated outputs: ${discoveredEvals.length} eval(s)`)
  if (resumeRunDir) {
    console.log(`resuming judge-only output run: ${toRelativePath(outputDirs.runDirectory)}`)
    console.log(
      `resume status: ${persistedResultsBefore.size} already judged, ${pendingEvals.length} remaining`
    )
  }
  const progress = createProgressReporter(discoveredEvals.length, {
    initialCompleted: persistedResultsBefore.size,
  })
  if (pendingEvals.length === 0) {
    console.log('resume status: nothing left to judge for the selected pattern')
  }

  const evalRuns = await runWithConcurrency(
    pendingEvals,
    cliOptions.concurrency,
    async (evalItem, index) => {
      try {
        const generatedEvalDirectory = path.join(sourceGeneratedDir, sanitizeSegment(evalItem.evalId))

        const [generatedFiles, referenceFiles, requirements] = await Promise.all([
          loadFiles(generatedEvalDirectory),
          loadFiles(path.join(evalItem.evalPath, 'reference')),
          readFile(path.join(evalItem.evalPath, 'requirements.yaml'), 'utf-8'),
        ])

        if (generatedFiles.length === 0) {
          throw new Error(
            `no generated files found for ${evalItem.evalId} in ${toRelativePath(generatedEvalDirectory)}`
          )
        }

        const llmJudgeStage = await runLlmJudgeStage(
          generatedFiles,
          referenceFiles,
          requirements,
          {
            model: cliOptions.model,
            timeout: cliOptions.timeout,
            port: cliOptions.port,
          } as any
        )

        const stageResult = {
          evalId: evalItem.evalId,
          evalPath: toRelativePath(evalItem.evalPath),
          judgeModel: cliOptions.model,
          solverModel: sourceSummary?.solverModel ?? null,
          llmJudgeRequirements: llmJudgeStage.requirements,
          score: llmJudgeStage.score,
          outputFiles: generatedFiles.map((file) => file.path),
          sourceGeneratedDir: toRelativePath(generatedEvalDirectory),
        }

        const resultFileName = `${sanitizeSegment(stageResult.evalId)}.json`
        await writeFile(
          path.join(outputDirs.evalDirectory, resultFileName),
          JSON.stringify(stageResult, null, 2),
          'utf8'
        )

        progress.tick({
          evalId: evalItem.evalId,
          scoreRatio: stageResult.score.ratio,
        })

        return { kind: 'success' as const, index, result: stageResult }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        console.error(`[judge-only][${evalItem.evalId}] ${errorMessage}`)

        if (cliOptions.failFast) {
          throw error
        }

        progress.tick({
          evalId: evalItem.evalId,
          error: true,
        })

        return {
          kind: 'error' as const,
          index,
          result: {
            evalId: evalItem.evalId,
            evalPath: toRelativePath(evalItem.evalPath),
          },
          error,
        }
      }
    }
  )

  type EvalRun = (typeof evalRuns)[number]
  type SuccessfulRun = Extract<EvalRun, { kind: 'success' }>
  type ErrorRun = Extract<EvalRun, { kind: 'error' }>

  const [successfulRuns, errorRuns] = evalRuns.reduce<[SuccessfulRun[], ErrorRun[]]>(
    ([suc, err], run) => {
      if (run.kind === 'error') {
        return [suc, err.concat(run)]
      }
      return [suc.concat(run), err]
    },
    [[], []]
  )

  const persistedResultsAfterAll = await readPersistedJudgeEvalResults(outputDirs.evalDirectory)
  const persistedResultsAfter = new Map(
    [...persistedResultsAfterAll].filter(([evalId]) => discoveredEvalIdSet.has(evalId))
  )
  const metrics = countMetricsFromPersistedResults(discoveredEvalIds, persistedResultsAfter)

  const evalsErrored = metrics.evalsErrored
  const weightedAverageScore = metrics.weightedAverageScore

  const summaryPayload = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: cliOptions.model,
    solverModel: sourceSummary?.solverModel ?? null,
    pattern: cliOptions.pattern,
    sourceRun: sourceRunRelativePath,
    sourceRunId: sourceSummary?.runId ?? null,
    sourceJudgeModel: sourceSummary?.judgeModel ?? null,
    sourceSolverModel: sourceSummary?.solverModel ?? null,
    evalCount: discoveredEvals.length,
    evalsProcessed: metrics.evalsProcessed,
    evalsErrored,
    requirementsTotal: metrics.requirementsTotal,
    requirementsPassed: metrics.requirementsPassed,
    weightedAverageScore,
    resumed: Boolean(resumeRunDir),
    resumeRun: resumeRunDir ? toRelativePath(resumeRunDir) : null,
    resumeSkippedEvals: persistedResultsBefore.size,
    resumeAttemptErrors: errorRuns.length,
  }

  const summaryPath = await writeSummary(outputDirs.runDirectory, summaryPayload)
  console.log(`run complete: ${toRelativePath(summaryPath)}`)
}

try {
  await main()
  process.exit(0)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
