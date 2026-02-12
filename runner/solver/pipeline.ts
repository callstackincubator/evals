import path from 'node:path'
import { cp, mkdir, readFile } from 'node:fs/promises'

import type { CliOptions } from 'runner/config'
import {
  runCodeEvaluator,
  type CodeEvaluatorResult,
} from 'runner/evaluators/code/run'
import { discoverEvals } from 'runner/evaluators/llm/discovery'
import {
  loadAppFiles,
  loadReferenceFiles,
} from 'runner/evaluators/llm/files'
import {
  createRunOutputDirectories,
  type EvalResult,
  writeDebugArtifacts,
  writePerEvalResult,
} from 'runner/evaluators/llm/output'
import { loadRequirements } from 'runner/evaluators/llm/requirements'
import {
  computeScore,
  type RequirementResult,
} from 'runner/evaluators/llm/utils'
import type { LoadedFile } from 'runner/utils/fs'
import { runSolver } from './index'
import { runWithConcurrency } from './concurrency'

type DiscoveredEval = Awaited<
  ReturnType<typeof import('runner/evaluators/llm/discovery').discoverEvals>
>[number]

type JudgeRunResult<TJudgeResult> = {
  value?: TJudgeResult
  error?: string
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function toRelativePath(value: string): string {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

async function loadPromptMarkdown(evalPath: string): Promise<string> {
  const promptPath = path.join(evalPath, 'prompt.md')

  try {
    return await readFile(promptPath, 'utf8')
  } catch {
    return ''
  }
}

export type SolverStageResult = {
  inputFiles: string[]
  errors: string[]
  solverSummary?: string
  solverErrors: string[]
  generatedDirectory?: string
  requirements?: Awaited<ReturnType<typeof loadRequirements>>
  generatedFiles?: LoadedFile[]
  referenceFiles?: LoadedFile[]
  codeEvaluation?: CodeEvaluatorResult
  stepCount: number
  maxSteps: number
  finished: boolean
  stepMetrics: Array<{
    step: number
    outputFileCount: number
    eslint: {
      errorCount: number
      warningCount: number
    }
    tsc: {
      errorCount: number
      warningCount: number
    }
    CC: number
    summary?: string
    errors: string[]
  }>
}

const SOLVER_TEMPLATE_DIRECTORY = path.resolve(
  process.cwd(),
  'runner',
  'solver',
  'template'
)
const MAX_SOLVER_STEPS = 10

function hasCodeIssues(codeResult: CodeEvaluatorResult) {
  return (
    codeResult.eslint.errorCount +
      codeResult.eslint.warningCount +
      codeResult.tsc.errorCount +
      codeResult.tsc.warningCount >
    0
  )
}

/*
  Runs eval preparation and solver generation for one discovered eval item.
 */
export async function runSolverStageForEval(
  evalItem: DiscoveredEval,
  generatedOutputsDirectory: string,
  cliOptions: CliOptions
): Promise<SolverStageResult> {
  const errors: string[] = []
  const solverErrors: string[] = []

  try {
    const requirements = await loadRequirements(evalItem.requirementsPath)

    const [loadedAppFiles, loadedReferenceFiles, promptMarkdown] =
      await Promise.all([
        loadAppFiles(evalItem.evalPath),
        loadReferenceFiles(evalItem.evalPath),
        loadPromptMarkdown(evalItem.evalPath),
      ])

    if (loadedReferenceFiles.length === 0) {
      console.warn(`(${evalItem.evalId}) skipping eval: missing reference/** baseline`)
      return {
        inputFiles: loadedAppFiles.map((file) => toRelativePath(file.absolutePath)),
        errors: [],
        solverSummary: 'skipped: missing reference/** baseline',
        solverErrors,
        requirements,
        generatedFiles: loadedAppFiles,
        stepCount: 0,
        maxSteps: MAX_SOLVER_STEPS,
        finished: false,
        stepMetrics: [],
      }
    }

    const generatedEvalDirectory = path.join(
      generatedOutputsDirectory,
      sanitizeSegment(evalItem.evalId)
    )
    await cp(SOLVER_TEMPLATE_DIRECTORY, generatedEvalDirectory, {
      recursive: true,
      force: true,
    })

    let currentInputFiles = loadedAppFiles
    let finalSolverResult: Awaited<ReturnType<typeof runSolver>> | undefined
    let finalCodeEvaluation: CodeEvaluatorResult | undefined
    const stepMetrics: SolverStageResult['stepMetrics'] = []
    let finished = false

    for (let step = 1; step <= MAX_SOLVER_STEPS; step += 1) {
      const solverResult = await runSolver({
        evalId: evalItem.evalId,
        model: cliOptions.solverModel,
        mockTestedLLM: cliOptions.mockTestedLLM,
        apiKey: cliOptions.apiKey,
        baseURL: cliOptions.baseURL,
        timeoutMs: cliOptions.solverTimeout,
        evalPath: evalItem.evalPath,
        outputDirectory: generatedEvalDirectory,
        promptMarkdown,
        requirements,
        inputFiles: currentInputFiles,
      })
      const codeResult = await runCodeEvaluator(
        solverResult.files,
        generatedEvalDirectory
      )

      stepMetrics.push({
        step,
        outputFileCount: solverResult.files.length,
        eslint: {
          errorCount: codeResult.eslint.errorCount,
          warningCount: codeResult.eslint.warningCount,
        },
        tsc: {
          errorCount: codeResult.tsc.errorCount,
          warningCount: codeResult.tsc.warningCount,
        },
        CC: codeResult.cyclomaticComplexity.total,
        summary: solverResult.summary,
        errors: solverResult.errors,
      })

      solverErrors.push(...solverResult.errors)
      errors.push(...solverResult.errors)

      finalSolverResult = solverResult
      finalCodeEvaluation = codeResult
      currentInputFiles = solverResult.files

      const noIssues = !hasCodeIssues(codeResult)
      if (noIssues || cliOptions.mockTestedLLM) {
        console.log(
          `(${evalItem.evalId}) Breaking out of LLM steps loop due to ${noIssues ? 'no issues' : 'mockTestedLLM enabled'}`
        )
        finished = noIssues
        break
      }
    }

    if (!finalSolverResult || !finalCodeEvaluation) {
      throw new Error('solver did not produce final output')
    }

    return {
      inputFiles: finalSolverResult.files.map((file) =>
        toRelativePath(file.absolutePath)
      ),
      errors,
      solverSummary: finalSolverResult.summary,
      solverErrors,
      generatedDirectory: generatedEvalDirectory,
      requirements,
      generatedFiles: finalSolverResult.files,
      referenceFiles: loadedReferenceFiles,
      codeEvaluation: finalCodeEvaluation,
      stepCount: stepMetrics.length,
      maxSteps: MAX_SOLVER_STEPS,
      finished,
      stepMetrics,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return {
      inputFiles: [],
      errors,
      solverErrors,
      stepCount: 0,
      maxSteps: MAX_SOLVER_STEPS,
      finished: false,
      stepMetrics: [],
    }
  }
}

export type LlmJudgeEvaluationResult = {
  requirementResults: RequirementResult[]
  summary?: string
  debugPrompt: string
  debugOutput: unknown
  errors: string[]
}

/*
  Runs discovery, solver stage, and bounded-concurrency eval execution.
 */
export async function runSolverBackedLlmExecution(params: {
  cliOptions: CliOptions
  judgeModel: string
  resultsDir: string
  runLlmJudgeEval: (params: {
    requirements: NonNullable<SolverStageResult['requirements']>
    files: NonNullable<SolverStageResult['generatedFiles']>
    referenceFiles: NonNullable<SolverStageResult['referenceFiles']>
  }) => Promise<LlmJudgeEvaluationResult>
}) {
  const discoveredEvals = await discoverEvals(params.cliOptions.pattern)
  const selectedEvals = params.cliOptions.justOne
    ? discoveredEvals.slice(0, 1)
    : discoveredEvals
  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const outputDirs = await createRunOutputDirectories(params.resultsDir, runId)
  const generatedOutputsDirectory = path.join(
    outputDirs.runDirectory,
    'generated'
  )

  await mkdir(generatedOutputsDirectory, { recursive: true })

  console.log(`starting run: ${selectedEvals.length} eval(s)`)

  const evalRunResults = await runWithConcurrency(
    selectedEvals,
    params.cliOptions.concurrency,
    async (evalItem, index) => {
      const errors: string[] = []
      const requirementsPath = evalItem.requirementsPath

      let inputFiles: string[] = []
      let requirementResults: RequirementResult[] = []
      let summary: string | undefined
      let debugPrompt: string | undefined
      let debugOutput: unknown
      let solverSummary: string | undefined
      let solverErrors: string[] = []
      let codeEvaluation: CodeEvaluatorResult | undefined
      let solverMaxSteps = MAX_SOLVER_STEPS
      let solverStepCount = 0
      let solverFinished = false
      let solverStepMetrics: SolverStageResult['stepMetrics'] = []

      try {
        const solverStage = await runSolverStageForEval(
          evalItem,
          generatedOutputsDirectory,
          params.cliOptions
        )

        inputFiles = solverStage.inputFiles
        solverSummary = solverStage.solverSummary
        solverErrors = solverStage.solverErrors
        solverMaxSteps = solverStage.maxSteps
        solverStepCount = solverStage.stepCount
        solverFinished = solverStage.finished
        solverStepMetrics = solverStage.stepMetrics
        errors.push(...solverStage.errors)

        if (
          solverStage.requirements !== undefined &&
          solverStage.generatedFiles !== undefined &&
          solverStage.referenceFiles !== undefined &&
          solverStage.generatedDirectory !== undefined
        ) {
          const requirements = solverStage.requirements
          const generatedFiles = solverStage.generatedFiles
          const referenceFiles = solverStage.referenceFiles
          const judgeResult = await params.runLlmJudgeEval({
            requirements,
            files: generatedFiles,
            referenceFiles,
          })
          requirementResults = judgeResult.requirementResults
          summary = judgeResult.summary
          debugPrompt = judgeResult.debugPrompt
          errors.push(...judgeResult.errors)
          codeEvaluation = solverStage.codeEvaluation

          debugOutput = {
            llmJudge: judgeResult.debugOutput,
            codeEvaluator: solverStage.codeEvaluation,
            solver: {
              model: params.cliOptions.solverModel,
              summary: solverSummary,
              errors: solverErrors,
              maxSteps: solverMaxSteps,
              stepCount: solverStepCount,
              finished: solverFinished,
              steps: solverStepMetrics,
            },
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
        judgeModel: params.judgeModel,
        requirementsPath: toRelativePath(requirementsPath),
        inputFiles,
        requirementResults,
        score,
        errors,
        summary,
        solver: {
          model: params.cliOptions.solverModel,
          outputFileCount: inputFiles.length,
          maxSteps: solverMaxSteps,
          stepCount: solverStepCount,
          finished: solverFinished,
          summary: solverSummary,
          errors: solverErrors,
          steps: solverStepMetrics,
        },
        code: codeEvaluation,
      }

      if (params.cliOptions.debug && debugPrompt) {
        const debugPaths = await writeDebugArtifacts(
          outputDirs.runDirectory,
          evalItem.evalId,
          debugPrompt,
          debugOutput !== undefined
            ? debugOutput
            : {
                error: errors.join('; '),
              }
        )

        result.promptPath = debugPaths.promptPath
        result.judgeOutputPath = debugPaths.judgeOutputPath
      }

      const indexItem = await writePerEvalResult(
        outputDirs.evalDirectory,
        result
      )
      const position = index + 1
      const codeStatus =
        result.code === undefined
          ? 'code:n/a'
          : `code:eslint(❌ ${result.code.eslint.errorCount} ⚠️  ${result.code.eslint.warningCount}) ` +
            `tsc(❌ ${result.code.tsc.errorCount} ⚠️  ${result.code.tsc.warningCount}) ` +
            `CC=${result.code.cyclomaticComplexity.total}`

      console.log(
        `[${position}/${selectedEvals.length}] ${evalItem.evalId} ` +
          `-> llm:${result.score.ratio} ${codeStatus} errors:${result.errors.length}`
      )

      if (params.cliOptions.debug && result.code) {
        const eslintIssues =
          result.code.eslint.errorCount + result.code.eslint.warningCount
        if (eslintIssues > 0 && result.code.eslint.output.length > 0) {
          console.error(
            `[eslint][${evalItem.evalId}] ${result.code.eslint.output}`
          )
        }

        const tscIssues =
          result.code.tsc.errorCount + result.code.tsc.warningCount
        if (tscIssues > 0 && result.code.tsc.output.length > 0) {
          console.error(`[tsc][${evalItem.evalId}] ${result.code.tsc.output}`)
        }
      }

      if (result.errors.length > 0) {
        if (params.cliOptions.debug) {
          console.error(result.errors.join('\n'))
        }

        if (params.cliOptions.failFast) {
          throw new Error('Failing fast due to --fail-fast flag')
        }
      }

      return {
        index,
        result,
        indexItem,
      }
    }
  )

  return {
    runId,
    startedAt,
    discoveredEvals: selectedEvals,
    outputDirs,
    evalRunResults,
  }
}
