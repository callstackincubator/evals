import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { readGenerationManifest } from './artifacts/generation-manifest'
import { parseJudgeCliArgs } from './config'
import {
  createRunOutputDirectories,
  writeDebugArtifacts,
  writeSummary,
} from './evaluators/llm/output'
import { runLlmJudgeStage } from './evaluators/llm/run'
import { runWithConcurrency } from './solver/concurrency'
import { discoverEvals } from './utils/discovery'
import { partitionEvalRuns } from './utils/eval-runs'
import { loadFiles, sanitizeSegment } from './utils/fs'

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
  const discoveredEvals = await discoverEvals(cliOptions.pattern)
  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const inputDirectory = path.resolve(process.cwd(), cliOptions.input)
  const outputDirectories = await createRunOutputDirectories(
    cliOptions.output ?? 'results',
    runId
  )
  const generationManifest = await readGenerationManifest(inputDirectory)
  const manifestEvalByPath = new Map(
    generationManifest.evals.map((evalArtifact) => [evalArtifact.evalPath, evalArtifact])
  )

  console.log(`starting judge: ${discoveredEvals.length} eval(s)`)

  const evalRuns = await runWithConcurrency(
    discoveredEvals,
    cliOptions.concurrency,
    async (evalItem, index) => {
      try {
        const evalPath = toRelativePath(evalItem.evalPath)
        const manifestEval = manifestEvalByPath.get(evalPath)
        if (!manifestEval) {
          throw new Error(`no generated entry in manifest for ${evalPath}`)
        }

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

        const [referenceFiles, requirements, prompt] = await Promise.all([
          loadFiles(path.join(evalItem.evalPath, 'reference')),
          readFile(path.join(evalItem.evalPath, 'requirements.yaml'), 'utf-8'),
          readFile(path.join(evalItem.evalPath, 'prompt.md'), 'utf-8'),
        ])

        const llmJudgeStage = await runLlmJudgeStage(
          generatedFiles,
          referenceFiles,
          requirements,
          cliOptions
        )

        const stageResult = {
          evalId: evalItem.evalId,
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
            evalItem.evalId,
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
          `[${position}/${discoveredEvals.length}] ${evalItem.evalId} ` +
            `-> llm:${stageResult.score.ratio}`
        )

        return { kind: 'success' as const, index, result: stageResult }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        console.error(`[judge-stage][${evalItem.evalId}] ${errorMessage}`)

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
    pattern: cliOptions.pattern,
    inputGeneratedArtifacts: toRelativePath(inputDirectory),
    evalCount: discoveredEvals.length,
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
