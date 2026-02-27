import { parseArgs as parseArgv } from 'node:util'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { readGenerationManifest } from './utils/generation-manifest'
import {
  createRunOutputDirectories,
  writeDebugArtifacts,
  writeSummary,
} from './evaluators/llm/output'
import { runLlmJudgeStage } from './evaluators/llm/run'
import { runWithConcurrency } from './solver/concurrency'
import { partitionEvalRuns } from './utils/eval-runs'
import { loadFiles, sanitizeSegment } from './utils/fs'
import { normalizeModelId } from './utils/model'

function parsePositiveInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${flagName} must be a positive integer`)
  }

  return parsedValue
}

function parseJudgeCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'concurrency': { type: 'string', default: '4' },
      'debug': { type: 'boolean', default: false },
      'fail-fast': { type: 'boolean', default: false },
      'model': { type: 'string' },
      'timeout': { type: 'string', default: '120000' },
      'port': { type: 'string' },
      'input': { type: 'string' },
      'output': { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  })

  if (!values.input) {
    throw new Error('--input is required for judge runs')
  }
  if (!values.model) {
    throw new Error('--model is required for judge runs')
  }

  return {
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    debug: values.debug ?? false,
    failFast: values['fail-fast'] ?? false,
    model: normalizeModelId(values.model) ?? values.model,
    solverModel: undefined as string | undefined,
    pattern: 'evals/**/*',
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: values.port ? parsePositiveInteger(values.port, '--port') : undefined,
    input: values.input,
    output: values.output,
  }
}

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function toRelativePath(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

/*
  Runs LLM judging only (no generation), validates the input manifest from
  `runner/run.ts`, and writes per-eval judge outputs plus aggregate summary.
*/
export async function runJudgeEntry(argv: string[] = Bun.argv.slice(2)) {
  const cliOptions = parseJudgeCliArgs(argv)
  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const inputDirectory = path.resolve(process.cwd(), cliOptions.input)
  const outputDirectory =
    cliOptions.output ??
    path.join('runs', sanitizeSegment(path.basename(inputDirectory)))
  const outputDirectories = await createRunOutputDirectories(
    outputDirectory
  )
  const generationManifest = await readGenerationManifest(inputDirectory)
  const manifestEvals = generationManifest.evals

  console.log(`judge output: ${toRelativePath(outputDirectories.runDirectory)}`)
  console.log(`starting judge: ${manifestEvals.length} eval(s)`)

  const evalRuns = await runWithConcurrency(
    manifestEvals,
    cliOptions.concurrency,
    async (manifestEval, index) => {
      try {
        const evalPath = manifestEval.evalPath
        const evalDirectory = path.resolve(process.cwd(), evalPath)
        const generatedEvalRunDirectory = path.join(
          inputDirectory,
          manifestEval.generatedPath
        )
        const generatedFiles = await loadFiles(generatedEvalRunDirectory)
        if (generatedFiles.length === 0) {
          throw new Error(
            `no generated files found in ${toRelativePath(generatedEvalRunDirectory)}`
          )
        }

        const [requirements, prompt] = await Promise.all([
          readFile(path.join(evalDirectory, 'requirements.yaml'), 'utf-8'),
          readFile(path.join(evalDirectory, 'prompt.md'), 'utf-8'),
        ])

        const referenceFiles = await loadFiles(
          path.join(evalDirectory, 'reference')
        ).catch(() => [])

        const llmJudgeStage = await runLlmJudgeStage(
          generatedFiles,
          referenceFiles,
          requirements,
          cliOptions
        )

        const stageResult = {
          evalId: manifestEval.evalId,
          evalPath,
          judgeModel: cliOptions.model,
          solverModel: generationManifest.solverModel,
          llmJudgeRequirements: llmJudgeStage.requirements,
          score: llmJudgeStage.score,
          outputFiles: generatedFiles.map((file) => file.path),
        }

        if (cliOptions.debug) {
          await writeDebugArtifacts(
            outputDirectories.runDirectory,
            manifestEval.evalId,
            prompt,
            llmJudgeStage
          )
        }

        const resultFileName = `${sanitizeSegment(stageResult.evalId)}.json`
        await writeFile(
          path.join(outputDirectories.evalDirectory, resultFileName),
          JSON.stringify(stageResult, null, 2),
          'utf8'
        )

        const position = index + 1
        console.log(
          `[${position}/${manifestEvals.length}] ${manifestEval.evalId} ` +
            `-> llm:${stageResult.score.ratio}`
        )

        return { kind: 'success' as const, index, result: stageResult }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        console.error(`[judge-stage][${manifestEval.evalId}] ${errorMessage}`)

        if (cliOptions.failFast) {
          throw error
        }

        return {
          kind: 'error' as const,
          index,
        }
      }
    }
  )

  const { successfulRuns, errorRuns } = partitionEvalRuns(evalRuns)

  const requirementsTotal = successfulRuns.reduce((sum, evalRun) => {
    return sum + evalRun.result.llmJudgeRequirements.length
  }, 0)

  const requirementsPassed = successfulRuns.reduce((sum, evalRun) => {
    return (
      sum +
      evalRun.result.llmJudgeRequirements.filter((requirement) => requirement.passed)
        .length
    )
  }, 0)

  const evalsErrored = errorRuns.length

  const weightedAverageScore =
    successfulRuns.length === 0
      ? 0
      : roundTo(
          successfulRuns.reduce((sum, run) => sum + run.result.score.ratio, 0) /
            successfulRuns.length,
          4
        )

  const summaryPayload = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: cliOptions.model,
    solverModel: generationManifest.solverModel,
    pattern: generationManifest.pattern,
    inputGeneratedArtifacts: toRelativePath(inputDirectory),
    evalCount: manifestEvals.length,
    evalsProcessed: successfulRuns.length,
    evalsErrored,
    requirementsTotal,
    requirementsPassed,
    weightedAverageScore,
  }

  const summaryPath = await writeSummary(outputDirectories.runDirectory, summaryPayload)
  console.log(`judge complete: ${toRelativePath(summaryPath)}`)

  return {
    runDirectory: outputDirectories.runDirectory,
    summaryPath,
  }
}

if (import.meta.main) {
  try {
    await runJudgeEntry()
    process.exit(0)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
