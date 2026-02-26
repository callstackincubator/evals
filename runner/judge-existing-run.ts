import { readFile, writeFile } from 'node:fs/promises'
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
  judgeModel?: string | null
  solverModel?: string | null
  pattern?: string | null
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

async function main() {
  const cliOptions = parseCliArgs()
  const sourceRunDir = path.resolve(process.cwd(), cliOptions.sourceRun)
  const sourceGeneratedDir = path.join(sourceRunDir, 'generated')
  const sourceSummary = await tryReadSourceSummary(sourceRunDir)

  const discoveredEvals = await discoverEvals(cliOptions.pattern)

  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const outputDirs = await createRunOutputDirectories('results', runId)

  console.log(`starting judge-only run from generated outputs: ${discoveredEvals.length} eval(s)`)
  const progress = createProgressReporter(discoveredEvals.length)

  const evalRuns = await runWithConcurrency(
    discoveredEvals,
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

  const sortedSuccessfulRuns = [...successfulRuns].sort(
    (left, right) => left.index - right.index
  )

  const requirementsTotal = sortedSuccessfulRuns.reduce((sum, evalRun) => {
    return sum + evalRun.result.llmJudgeRequirements.length
  }, 0)

  const requirementsPassed = sortedSuccessfulRuns.reduce((sum, evalRun) => {
    return (
      sum +
      evalRun.result.llmJudgeRequirements.filter((requirement) => requirement.passed)
        .length
    )
  }, 0)

  const evalsErrored = errorRuns.length

  const weightedAverageScore =
    sortedSuccessfulRuns.length === 0
      ? 0
      : Math.round(
          (sortedSuccessfulRuns.reduce((sum, run) => sum + run.result.score.ratio, 0) /
            sortedSuccessfulRuns.length) *
            10000
        ) / 10000

  const summaryPayload = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: cliOptions.model,
    solverModel: sourceSummary?.solverModel ?? null,
    pattern: cliOptions.pattern,
    sourceRun: toRelativePath(sourceRunDir),
    sourceRunId: sourceSummary?.runId ?? null,
    sourceJudgeModel: sourceSummary?.judgeModel ?? null,
    sourceSolverModel: sourceSummary?.solverModel ?? null,
    evalCount: discoveredEvals.length,
    evalsProcessed: sortedSuccessfulRuns.length,
    evalsErrored,
    requirementsTotal,
    requirementsPassed,
    weightedAverageScore,
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
