import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { parseCliArgs } from './config'
import { discoverEvals } from './utils/discovery'
import {
  createRunOutputDirectories,
  writeDebugArtifacts,
  writeSummary,
} from './evaluators/llm/output'

import { runLlmJudgeStage } from './evaluators/llm/run'
import { runWithConcurrency } from './solver/concurrency'
import { runSolverStage } from './solver/pipeline'
import { loadFiles, sanitizeSegment } from './utils/fs'
import { createProgressReporter } from './utils/progress'

const RESULTS_DIR = 'results'

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function toRelativePath(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

/*
  End-to-end benchmark pipeline:
  1. Discover evals and initialize run output directories.
  2. Execute solver for each eval (bounded concurrency).
  3. Run LLM judging on solver output.
  4. Persist per-eval artifacts and write aggregate summary.
*/
async function main() {
  // Parse runtime options and choose which evals to execute.
  const cliOptions = parseCliArgs()
  const discoveredEvals = await discoverEvals(cliOptions.pattern)

  // Prepare directories for generated outputs and run artifacts.
  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const outputDirs = await createRunOutputDirectories(RESULTS_DIR, runId)
  const generatedOutputsDirectory = path.join(
    outputDirs.runDirectory,
    'generated'
  )
  await mkdir(generatedOutputsDirectory, { recursive: true })

  console.log(`starting run: ${discoveredEvals.length} eval(s)`)
  const progress = createProgressReporter(discoveredEvals.length)

  // Process evals concurrently while preserving stable final ordering.
  const evalRuns = await runWithConcurrency(
    discoveredEvals,
    cliOptions.concurrency,
    async (evalItem, index) => {
      try {
        // Prep: Load eval files
        const [appFiles, referenceFiles, requirements, prompt] = await Promise.all([
          loadFiles(path.join(evalItem.evalPath, 'app')),
          loadFiles(path.join(evalItem.evalPath, 'reference')),
          readFile(path.join(evalItem.evalPath, 'requirements.yaml'), 'utf-8'),
          readFile(path.join(evalItem.evalPath, 'prompt.md'), 'utf-8'),
        ])

        const generatedEvalRunDirectory = path.join(
          generatedOutputsDirectory,
          sanitizeSegment(evalItem.evalId)
        )

        // Step 1: Run solver stage.
        const solverStage = await runSolverStage(
          prompt,
          appFiles,
          referenceFiles,
          generatedEvalRunDirectory,
          cliOptions
        )

        // Step 2: Run LLM judge on the produced code
        const llmJudgeStage = await runLlmJudgeStage(
          solverStage.files,
          referenceFiles,
          requirements,
          cliOptions,
        )

        // Step 3: Compose the final per-eval result payload.
        const stageResult = {
          evalId: evalItem.evalId,
          evalPath: toRelativePath(evalItem.evalPath),
          judgeModel: cliOptions.model ?? 'noop',
          solverModel: cliOptions.solverModel ?? 'noop',
          llmJudgeRequirements: llmJudgeStage.requirements,
          score: llmJudgeStage.score,
          outputFiles: solverStage.files.map((file) => file.path),
        }

        // Step 4: Optionally write debug artifacts.
        if (cliOptions.debug) {
          await writeDebugArtifacts(
            outputDirs.runDirectory,
            evalItem.evalId,
            prompt,
            llmJudgeStage
          )
          // tbd: attach this to result as debug.
        }

        // Step 5: Persist per-eval output and report progress.
        const resultFileName = `${sanitizeSegment(stageResult.evalId)}.json`
        await writeFile(
          path.join(outputDirs.evalDirectory, resultFileName),
          JSON.stringify(stageResult, null, 2),
          'utf8'
        )
        const indexItem = {
          evalId: stageResult.evalId,
          path: `evals/${resultFileName}`,
          scoreRatio: stageResult.score.ratio,
        }

        progress.tick({
          evalId: evalItem.evalId,
          scoreRatio: stageResult.score.ratio,
        })

        return { kind: 'success' as const, index, result: stageResult, indexItem }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        console.error(`[solver-stage][${evalItem.evalId}] ${errorMessage}`)

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
          error
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
      : roundTo(
          sortedSuccessfulRuns.reduce((sum, run) => sum + run.result.score.ratio, 0) /
          sortedSuccessfulRuns.length,
          4
        )

  const summaryPayload = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: cliOptions.model ?? null,
    solverModel: cliOptions.solverModel,
    pattern: cliOptions.pattern,
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
