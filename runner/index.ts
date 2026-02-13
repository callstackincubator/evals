import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { parseCliArgs } from './config'
import {
  runCodeEvaluatorStage,
  type CodeEvaluatorResult,
} from './evaluators/code/run'
import { discoverEvals } from './utils/discovery'
import {
  createRunOutputDirectories,
  writeDebugArtifacts,
  writeSummary,
} from './evaluators/llm/output'

import { runLlmJudgeStage } from './evaluators/llm/run'
import { runWithConcurrency } from './solver/concurrency'
import { runSolverStage } from './solver/pipeline'
import { writeFile } from 'node:fs/promises'
import { loadFiles, sanitizeSegment } from './utils/fs'
import { readFile } from 'node:fs/promises'

const RESULTS_DIR = 'results'

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function toRelativePath(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

function formatCheckStatus(
  name: string,
  errorCount: number,
  warningCount: number
) {
  if (errorCount === 0 && warningCount === 0) {
    return `${name}:ok`
  }

  const parts: string[] = []
  if (errorCount > 0) {
    parts.push(`❌ ${errorCount}`)
  }
  if (warningCount > 0) {
    parts.push(`⚠️ ${warningCount}`)
  }

  return `${name}:${parts.join(' ')}`
}

/*
  End-to-end benchmark pipeline:
  1. Discover evals and initialize run output directories.
  2. Execute solver for each eval (bounded concurrency).
  3. Run static checks and LLM judging on solver output.
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

        // Step 2: Evaluate generated files with static checks.
        const codeEvaluationStage = await runCodeEvaluatorStage(
          solverStage.files,
          generatedEvalRunDirectory,
        )

        // Step 3: Run LLM judge on the produced code
        const llmJudgeStage = await runLlmJudgeStage(
          solverStage.files,
          referenceFiles,
          requirements,
          cliOptions,
        )

        // Step 4: Compose the final per-eval result payload.
        const stageResult = {
          evalId: evalItem.evalId,
          evalPath: toRelativePath(evalItem.evalPath),
          judgeModel: cliOptions.model ?? 'noop',
          solverModel: cliOptions.solverModel ?? 'noop',
          llmJudgeRequirements: llmJudgeStage.requirements,
          score: llmJudgeStage.score,
          outputFiles: solverStage.files.map((file) => file.path),
          code: codeEvaluationStage,
        }

        // Step 5: Optionally write debug artifacts.
        if (cliOptions.debug) {
          await writeDebugArtifacts(
            outputDirs.runDirectory,
            evalItem.evalId,
            prompt,
            llmJudgeStage
          )
          // tbd: attach this to result as debug.
        }

        // Step 6: Persist per-eval output and report progress.
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

        const position = index + 1
        const codeStatus =
          stageResult.code === undefined
            ? 'code:n/a'
            : `code:${formatCheckStatus(
                'eslint',
                stageResult.code.eslint.errorCount,
                stageResult.code.eslint.warningCount
              )} ` +
              `${formatCheckStatus(
                'tsc',
                stageResult.code.tsc.errorCount,
                stageResult.code.tsc.warningCount
              )} ` +
              `CC=${stageResult.code.cyclomaticComplexity.total}`

        console.log(
          `[${position}/${discoveredEvals.length}] ${evalItem.evalId} ` +
            `-> llm:${stageResult.score.ratio} ${codeStatus}`
        )

        // Optional detailed logging for failed static checks.
        if (cliOptions.debug && stageResult.code) {
          const eslintIssues =
            stageResult.code.eslint.errorCount + stageResult.code.eslint.warningCount
          if (eslintIssues > 0 && stageResult.code.eslint.output.length > 0) {
            console.error(`[eslint][${evalItem.evalId}] ${stageResult.code.eslint.output}`)
          }

          const tscIssues =
            stageResult.code.tsc.errorCount + stageResult.code.tsc.warningCount
          if (tscIssues > 0 && stageResult.code.tsc.output.length > 0) {
            console.error(`[tsc][${evalItem.evalId}] ${stageResult.code.tsc.output}`)
          }
        }

        return { kind: 'success' as const, index, result: stageResult, indexItem }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        console.error(`[solver-stage][${evalItem.evalId}] ${errorMessage}`)

        if (cliOptions.failFast) {
          throw error
        }

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

  const codeEvaluations = sortedSuccessfulRuns
    .map((result) => result.result.code)
    .filter((result): result is CodeEvaluatorResult => result !== undefined)
  
  const totalCyclomaticComplexity = codeEvaluations.reduce((sum, result) => {
    return sum + result.cyclomaticComplexity.total
  }, 0)

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
    codeChecks: {
      evalsWithCodeChecks: codeEvaluations.length,
      eslintErrorCount: codeEvaluations.reduce((sum, result) => {
        return sum + result.eslint.errorCount
      }, 0),
      eslintWarningCount: codeEvaluations.reduce((sum, result) => {
        return sum + result.eslint.warningCount
      }, 0),
      tscErrorCount: codeEvaluations.reduce((sum, result) => {
        return sum + result.tsc.errorCount
      }, 0),
      tscWarningCount: codeEvaluations.reduce((sum, result) => {
        return sum + result.tsc.warningCount
      }, 0),
      averageCC:
        codeEvaluations.length === 0
          ? 0
          : roundTo(totalCyclomaticComplexity / codeEvaluations.length, 4),
    },
  }

  // tbd: bring this back in a follow-up
  // printResultsReportTable(evalResults)

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
