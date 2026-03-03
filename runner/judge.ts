import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { readGenerationManifest } from './utils/generation-manifest'
import { parseJudgeCliArgs } from './config'
import {
  createRunOutputDirectories,
  writeDebugArtifacts,
  writeSummary,
} from './evaluators/llm/output'
import { runLlmJudgeStage } from './evaluators/llm/run'
import { runWithConcurrency } from './solver/concurrency'
import { partitionEvalRuns } from './utils/eval-runs'
import { loadFile, loadFiles, sanitizeSegment } from './utils/fs'

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function toRelativePath(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

function getEvalResultSubdirectory(generatedPath: string) {
  const normalizedPath = generatedPath.replace(/\\/g, '/').replace(/^\/+/, '')
  const parentDirectory = path.posix.dirname(normalizedPath)
  if (parentDirectory === '.' || parentDirectory.startsWith('..')) {
    return ''
  }
  return parentDirectory
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
  const outputDirectory = cliOptions.output ?? path.dirname(inputDirectory)
  const outputDirectories = await createRunOutputDirectories(outputDirectory)
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

        const packageJson = await loadFile(
          path.join(process.cwd(), 'testbench/package.json')
        )

        const llmJudgeStage = await runLlmJudgeStage(
          [packageJson, ...generatedFiles],
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
        const resultSubdirectory = getEvalResultSubdirectory(
          manifestEval.generatedPath
        )
        const resultDirectory = path.join(
          outputDirectories.evalDirectory,
          resultSubdirectory
        )
        await mkdir(resultDirectory, { recursive: true })
        await writeFile(
          path.join(resultDirectory, resultFileName),
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
        const errorMessage =
          (error instanceof Error ? error.stack : String(error)) ?? error
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
      evalRun.result.llmJudgeRequirements.filter(
        (requirement) => requirement.passed
      ).length
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

  const summaryPath = await writeSummary(
    outputDirectories.runDirectory,
    summaryPayload
  )
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
