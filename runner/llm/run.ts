import path from 'node:path'

import { parseCliArgs } from './config'
import { discoverEvals } from './discovery'
import { collectMissingInputFiles, loadInputFiles } from './files'
import { createJudgeClient, type JudgeOutput } from './judge-client'
import {
  createRunOutputDirectories,
  type EvalResult,
  writeDebugArtifacts,
  writePerEvalResult,
  writeSummary,
} from './output'
import { buildJudgePrompt } from './prompt'
import { loadRequirements, type RequirementDefinition } from './requirements'
import {
  computeScore,
  normalizeWeight,
  type RequirementResult,
  runWithConcurrency,
} from './utils'

const RESULTS_DIR = 'results'

function toRelativePath(value: string): string {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

/*
  Maps judge rows onto declared requirements and fills missing rows as failures.
 */
function mapRequirementResults(
  requirements: RequirementDefinition[],
  judgeRows: JudgeOutput['requirements'],
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
  Runs full LLM-judge pipeline: discovery, judging, scoring, and artifact writes.
 */
export async function runLlmJudgePipeline() {
  // Initialize runtime settings and a single shared judge client.
  const cliOptions = parseCliArgs()
  const runJudgeCall = createJudgeClient({
    model: cliOptions.model,
    timeoutMs: cliOptions.timeout,
    port: cliOptions.port,
  })

  // Discover eval inputs and prepare output directories for this run.
  const discoveredEvals = await discoverEvals(cliOptions.pattern)

  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()

  const outputDirs = await createRunOutputDirectories(RESULTS_DIR, runId)

  console.log(`starting llm-judge run: ${discoveredEvals.length} eval(s)`)

  // Process each eval with bounded concurrency and collect per-eval outputs.
  const evalRunResults = await runWithConcurrency(
    discoveredEvals,
    cliOptions.concurrency,
    async (evalItem, index) => {
      const errors: string[] = []
      const requirementsPath = evalItem.requirementsPath

      let inputFiles: string[] = []
      let requirementResults: RequirementResult[] = []
      let summary: string | undefined
      let debugPrompt: string | undefined
      let debugOutput: unknown

      try {
        const requirements = await loadRequirements(requirementsPath)
        inputFiles = requirements.inputs.files

        const missingInputFiles = await collectMissingInputFiles(
          evalItem.evalPath,
          requirements,
        )
        if (missingInputFiles.length > 0) {
          errors.push(`missing input files: ${missingInputFiles.join(', ')}`)
        } else {
          const loadedInputFiles = await loadInputFiles(evalItem.evalPath, requirements)

          debugPrompt = buildJudgePrompt(requirements, loadedInputFiles)

          try {
            const judgeResult = await runJudgeCall(debugPrompt)

            requirementResults = mapRequirementResults(
              requirements.requirements,
              judgeResult.requirements,
            )
            summary = judgeResult.summary
            debugOutput = judgeResult
          } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error))
          }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
      }

      const score = computeScore(requirementResults)

      const result: EvalResult = {
        runId,
        evalId: evalItem.evalId,
        evalPath: toRelativePath(evalItem.evalPath),
        judgeModel: cliOptions.model,
        requirementsPath: toRelativePath(requirementsPath),
        inputFiles,
        requirementResults,
        score,
        errors,
        summary,
      }

      if (cliOptions.debug && debugPrompt) {
        const debugPaths = await writeDebugArtifacts(
          outputDirs.runDirectory,
          evalItem.evalId,
          debugPrompt,
          debugOutput !== undefined
            ? debugOutput
            : {
                error: errors.join('; '),
              },
        )

        result.promptPath = debugPaths.promptPath
        result.judgeOutputPath = debugPaths.judgeOutputPath
      }

      const indexItem = await writePerEvalResult(outputDirs.evalDirectory, result)

      const position = index + 1
      console.log(
        `[${position}/${discoveredEvals.length}] ${evalItem.evalId} ` +
          `-> score:${result.score.ratio} errors:${result.errors.length}`,
      )

      return {
        index,
        result,
        indexItem,
      }
    },
  )

  // Aggregate run-level metrics from all evaluated items.
  const sortedEvalResults = [...evalRunResults].sort((left, right) => left.index - right.index)

  const evalResults = sortedEvalResults.map((item) => item.result)
  const evalResultsIndex = sortedEvalResults.map((item) => item.indexItem)

  const requirementsTotal = evalResults.reduce((accumulator, evalResult) => {
    return accumulator + evalResult.requirementResults.length
  }, 0)

  const requirementsPassed = evalResults.reduce((accumulator, evalResult) => {
    const passedInEval = evalResult.requirementResults.filter(
      (requirement) => requirement.passed,
    ).length
    return accumulator + passedInEval
  }, 0)

  const evalsErrored = evalResults.filter(
    (evalResult) => evalResult.errors.length > 0,
  ).length

  const scoreSum = evalResults.reduce((accumulator, evalResult) => {
    return accumulator + evalResult.score.ratio
  }, 0)

  const weightedAverageScore = evalResults.length === 0
    ? 0
    : roundTo(scoreSum / evalResults.length, 4)

  const summaryPayload = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: cliOptions.model,
    pattern: cliOptions.pattern,
    evalCount: discoveredEvals.length,
    evalsProcessed: evalResults.length,
    evalsErrored,
    requirementsTotal,
    requirementsPassed,
    weightedAverageScore,
    evalResultsIndex,
  }

  // Persist summary artifact and finish the run.
  const summaryPath = await writeSummary(
    outputDirs.runDirectory,
    summaryPayload,
  )

  console.log(`run complete: ${summaryPath}`)
}
