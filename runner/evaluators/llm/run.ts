import path from 'node:path'

import type { CliOptions } from 'runner/config'
import type { CodeEvaluatorResult } from 'runner/evaluators/code/run'
import {
  runSolverBackedLlmExecution,
  type LlmJudgeEvaluationResult,
} from 'runner/solver/pipeline'
import { createJudgeClient, type JudgeOutput } from './judge-client'
import { type EvalResult, writeSummary } from './output'
import { buildJudgePrompt } from './prompt'
import { loadRequirements, type RequirementDefinition } from './requirements'
import { normalizeWeight } from './utils'
import type { LoadedFile } from 'runner/utils/fs'

const RESULTS_DIR = 'results'

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

function formatTableCell(value: string, width: number) {
  return value.padEnd(width, ' ')
}

function formatIssueCounts(errorCount: number, warningCount: number) {
  return `❌ ${errorCount} ⚠️  ${warningCount}`
}

function formatStepMetrics(result: EvalResult) {
  const steps = result.solver?.steps
  if (!steps || steps.length === 0) {
    return 'n/a'
  }

  return steps
    .map(
      (stepMetric) =>
        `#${stepMetric.step}(E${stepMetric.eslint.errorCount}/W${stepMetric.eslint.warningCount},` +
        `T${stepMetric.tsc.errorCount}/W${stepMetric.tsc.warningCount},CC${stepMetric.CC})`
    )
    .join(' ')
}

function printResultsReportTable(evalResults: EvalResult[]) {
  if (evalResults.length === 0) {
    return
  }

  const headers = ['eval', 'llm', 'ESLint', 'TSC', 'Cycl. Compl.', 'steps', 'err']
  const rows = evalResults.map((result) => [
    result.evalId,
    result.score.ratio.toFixed(4),
    result.code === undefined
      ? 'n/a'
      : formatIssueCounts(
          result.code.eslint.errorCount,
          result.code.eslint.warningCount
        ),
    result.code === undefined
      ? 'n/a'
      : formatIssueCounts(
          result.code.tsc.errorCount,
          result.code.tsc.warningCount
        ),
    result.code === undefined
      ? 'n/a'
      : String(result.code.cyclomaticComplexity.total),
    formatStepMetrics(result),
    String(result.errors.length),
  ])

  const widths = headers.map((header, index) => {
    const maxCellWidth = rows.reduce((maxWidth, row) => {
      return Math.max(maxWidth, row[index]?.length ?? 0)
    }, 0)
    return Math.max(header.length, maxCellWidth)
  })

  const headerRow = headers
    .map((header, index) =>
      formatTableCell(header, widths[index] ?? header.length)
    )
    .join(' | ')
  const divider = widths.map((width) => '-'.repeat(width)).join('-|-')

  console.log('\nresults table')
  console.log(headerRow)
  console.log(divider)
  for (const row of rows) {
    console.log(
      row
        .map((cell, index) =>
          formatTableCell(cell, widths[index] ?? cell.length)
        )
        .join(' | ')
    )
  }
  console.log('')
}

/*
  Maps judge rows onto declared requirements and fills missing rows as failures.
 */
function mapRequirementResults(
  requirements: RequirementDefinition[],
  judgeRows: JudgeOutput['requirements']
) {
  const rowsById = new Map(judgeRows.map((row) => [row.id, row]))

  return requirements.map((requirement) => {
    const row = rowsById.get(requirement.id)
    const normalizedWeight = normalizeWeight(requirement.weight)

    if (!row) {
      return {
        id: requirement.id,
        description: requirement.description,
        weight: normalizedWeight,
        passed: false,
        reason: 'judge did not return a result for this requirement',
        evidence: [],
      }
    }

    return {
      id: requirement.id,
      description: requirement.description,
      weight: normalizedWeight,
      passed: row.passed,
      reason: row.reason,
      evidence: row.evidence,
      confidence: row.confidence,
    }
  })
}

/*
  Runs the LLM judge for one eval output and returns mapped requirement verdicts.
 */
async function runLlmJudgeForEval(params: {
  requirements: Awaited<ReturnType<typeof loadRequirements>>
  files: LoadedFile[]
  referenceFiles: LoadedFile[]
  mockJudgeLLM: boolean
  runJudgeCall: ReturnType<typeof createJudgeClient>
}): Promise<LlmJudgeEvaluationResult> {
  const debugPrompt = buildJudgePrompt(
    params.requirements,
    params.files,
    params.referenceFiles
  )

  if (params.mockJudgeLLM) {
    const mockedJudgeRows: JudgeOutput['requirements'] =
      params.requirements.requirements.map((requirement) => ({
        id: requirement.id,
        passed: true,
        reason: 'mockJudgeLLM enabled',
        evidence: ['mocked judge result'],
        confidence: 1,
      }))

    return {
      requirementResults: mapRequirementResults(
        params.requirements.requirements,
        mockedJudgeRows
      ),
      summary: 'mockJudgeLLM enabled: all requirements marked as passed',
      debugPrompt,
      debugOutput: {
        summary: 'mockJudgeLLM enabled: all requirements marked as passed',
        requirements: mockedJudgeRows,
      },
      errors: [],
    }
  }

  try {
    const judgeResult = await params.runJudgeCall(debugPrompt)
    return {
      requirementResults: mapRequirementResults(
        params.requirements.requirements,
        judgeResult.requirements
      ),
      summary: judgeResult.summary,
      debugPrompt,
      debugOutput: judgeResult,
      errors: [],
    }
  } catch (error) {
    return {
      requirementResults: [],
      debugPrompt,
      debugOutput: {
        error: error instanceof Error ? error.message : String(error),
      },
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/*
  Runs solver -> parallel llm-judge and code checks with bounded eval concurrency.
 */
export async function runLlmJudgePipeline(cliOptions: CliOptions) {
  const runJudgeCall = createJudgeClient({
    model: cliOptions.model,
    timeoutMs: cliOptions.timeout,
    port: cliOptions.port,
  })

  const { runId, startedAt, discoveredEvals, outputDirs, evalRunResults } =
    await runSolverBackedLlmExecution({
      cliOptions,
      judgeModel: cliOptions.model,
      resultsDir: RESULTS_DIR,
      runLlmJudgeEval: async ({ requirements, files, referenceFiles }) =>
        await runLlmJudgeForEval({
          requirements,
          files,
          referenceFiles,
          mockJudgeLLM: cliOptions.mockJudgeLLM,
          runJudgeCall,
        }),
    })

  const sortedEvalResults = [...evalRunResults].sort(
    (left, right) => left.index - right.index
  )
  const evalResults = sortedEvalResults.map((item) => item.result)
  const evalResultsIndex = sortedEvalResults.map((item) => item.indexItem)
  printResultsReportTable(evalResults)

  const requirementsTotal = evalResults.reduce((accumulator, evalResult) => {
    return accumulator + evalResult.requirementResults.length
  }, 0)
  const requirementsPassed = evalResults.reduce((accumulator, evalResult) => {
    const passedInEval = evalResult.requirementResults.filter(
      (requirement) => requirement.passed
    ).length
    return accumulator + passedInEval
  }, 0)
  const evalsErrored = evalResults.filter(
    (evalResult) => evalResult.errors.length > 0
  ).length
  const scoreSum = evalResults.reduce((accumulator, evalResult) => {
    return accumulator + evalResult.score.ratio
  }, 0)
  const weightedAverageScore =
    evalResults.length === 0 ? 0 : roundTo(scoreSum / evalResults.length, 4)

  const codeEvaluations = evalResults
    .map((result) => result.code)
    .filter((result): result is CodeEvaluatorResult => result !== undefined)
  const eslintErrorCount = codeEvaluations.reduce((accumulator, result) => {
    return accumulator + result.eslint.errorCount
  }, 0)
  const eslintWarningCount = codeEvaluations.reduce((accumulator, result) => {
    return accumulator + result.eslint.warningCount
  }, 0)
  const tscErrorCount = codeEvaluations.reduce((accumulator, result) => {
    return accumulator + result.tsc.errorCount
  }, 0)
  const tscWarningCount = codeEvaluations.reduce((accumulator, result) => {
    return accumulator + result.tsc.warningCount
  }, 0)
  const totalCyclomaticComplexity = codeEvaluations.reduce(
    (accumulator, result) => {
      return accumulator + result.cyclomaticComplexity.total
    },
    0
  )
  const averageCyclomaticComplexity =
    codeEvaluations.length === 0
      ? 0
      : roundTo(totalCyclomaticComplexity / codeEvaluations.length, 4)

  const summaryPayload = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: cliOptions.model,
    solverModel: cliOptions.solverModel,
    pattern: cliOptions.pattern,
    evalCount: discoveredEvals.length,
    evalsProcessed: evalResults.length,
    evalsErrored,
    requirementsTotal,
    requirementsPassed,
    weightedAverageScore,
    codeChecks: {
      evalsWithCodeChecks: codeEvaluations.length,
      eslintErrorCount,
      eslintWarningCount,
      tscErrorCount,
      tscWarningCount,
      averageCC: averageCyclomaticComplexity,
    },
    evalResultsIndex,
  }

  const summaryPath = await writeSummary(
    outputDirs.runDirectory,
    summaryPayload
  )
  console.log(`run complete: ${summaryPath}`)
}
