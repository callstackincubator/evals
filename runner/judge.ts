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
import { computeScore, type RequirementResult } from './evaluators/llm/utils'
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

function toPosixRelativePath(fromDirectory: string, targetPath: string) {
  return path.relative(fromDirectory, targetPath).split(path.sep).join('/')
}

function getEvalResultSubdirectory(generatedPath: string) {
  const normalizedPath = generatedPath.replace(/\\/g, '/').replace(/^\/+/, '')
  const parentDirectory = path.posix.dirname(normalizedPath)
  if (parentDirectory === '.' || parentDirectory.startsWith('..')) {
    return ''
  }
  return parentDirectory
}

function formatUnknownError(error: unknown) {
  if (error instanceof Error) {
    return error.stack ?? error.message ?? error.name
  }

  return String(error)
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  )
}

type PersistedEvalResult = {
  evalId: string
  evalPath: string
  judgeModel: string
  solverModel: string
  llmJudgeRequirements: RequirementResult[]
  score: {
    passedWeight: number
    totalWeight: number
    ratio: number
  }
  outputFiles: string[]
  judgeSessionArtifactPath?: string
}

type ManifestEval = Awaited<ReturnType<typeof readGenerationManifest>>['evals'][number]

function parsePersistedEvalResult(
  raw: string,
  resultFilePath: string
): PersistedEvalResult {
  const parsed = JSON.parse(raw) as Partial<PersistedEvalResult>

  if (
    !Array.isArray(parsed.llmJudgeRequirements) ||
    !parsed.score ||
    typeof parsed.score.ratio !== 'number'
  ) {
    throw new Error(
      `invalid per-eval judge output at ${toRelativePath(resultFilePath)}`
    )
  }

  return parsed as PersistedEvalResult
}

function getResultFilePath(
  runDirectory: string,
  generatedPath: string,
  evalId: string
) {
  const resultSubdirectory = getEvalResultSubdirectory(generatedPath)
  const resultDirectory = path.join(runDirectory, 'evals', resultSubdirectory)
  const resultFileName = `${sanitizeSegment(evalId)}.json`

  return path.join(resultDirectory, resultFileName)
}

async function backupExistingSummary(runDirectory: string) {
  const summaryPath = path.join(runDirectory, 'summary.json')
  const backupSuffix = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(
    runDirectory,
    `summary.backup.${backupSuffix}.json`
  )

  try {
    const existingSummary = await readFile(summaryPath, 'utf8')
    await writeFile(backupPath, existingSummary, 'utf8')
    return backupPath
  } catch (error) {
    if (isNotFoundError(error)) {
      return undefined
    }
    throw error
  }
}

async function rebuildSummaryFromExistingResults(options: {
  runDirectory: string
  inputDirectory: string
  generationManifest: Awaited<ReturnType<typeof readGenerationManifest>>
  judgeModel: string
}) {
  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const successfulRuns: PersistedEvalResult[] = []
  let evalsErrored = 0

  for (const manifestEval of options.generationManifest.evals) {
    const resultFilePath = getResultFilePath(
      options.runDirectory,
      manifestEval.generatedPath,
      manifestEval.evalId
    )

    try {
      const raw = await readFile(resultFilePath, 'utf8')
      const parsed = parsePersistedEvalResult(raw, resultFilePath)
      successfulRuns.push(parsed)
    } catch (error) {
      if (isNotFoundError(error)) {
        evalsErrored += 1
        continue
      }

      throw error
    }
  }

  const requirementsTotal = successfulRuns.reduce((sum, evalRun) => {
    return sum + evalRun.llmJudgeRequirements.length
  }, 0)

  const requirementsPassed = successfulRuns.reduce((sum, evalRun) => {
    return (
      sum +
      evalRun.llmJudgeRequirements.filter((requirement) => requirement.passed)
        .length
    )
  }, 0)

  const weightedAverageScore =
    successfulRuns.length === 0
      ? 0
      : roundTo(
          successfulRuns.reduce((sum, run) => sum + run.score.ratio, 0) /
            successfulRuns.length,
          4
        )

  return {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    judgeModel: options.judgeModel,
    solverModel: options.generationManifest.solverModel,
    pattern: options.generationManifest.pattern,
    inputGeneratedArtifacts: toRelativePath(options.inputDirectory),
    evalCount: options.generationManifest.evals.length,
    evalsProcessed: successfulRuns.length,
    evalsErrored,
    requirementsTotal,
    requirementsPassed,
    weightedAverageScore,
  }
}

async function runJudgeForManifestEval(options: {
  manifestEval: ManifestEval
  index: number
  total: number
  cliOptions: ReturnType<typeof parseJudgeCliArgs>
  inputDirectory: string
  outputDirectories: Awaited<ReturnType<typeof createRunOutputDirectories>>
  solverModel: string
}) {
  const { manifestEval } = options
  const evalPath = manifestEval.evalPath
  const evalDirectory = path.resolve(process.cwd(), evalPath)
  const generatedEvalRunDirectory = path.join(
    options.inputDirectory,
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

  const packageJson = await loadFile(path.join(process.cwd(), 'testbench/package.json'))

  const llmJudgeStage = await runWithRetries(
    () =>
      runLlmJudgeStage([packageJson, ...generatedFiles], requirements, {
        ...options.cliOptions,
        directory: process.cwd(),
      }),
    options.cliOptions.maxRetries,
    (attempt, error) => {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn(
        `[judge-stage][${manifestEval.evalId}] attempt ${attempt}/${options.cliOptions.maxRetries} failed: ${errorMessage}`
      )
    }
  )

  const stageResult = {
    evalId: manifestEval.evalId,
    evalPath,
    judgeModel: options.cliOptions.model,
    solverModel: options.solverModel,
    llmJudgeRequirements: llmJudgeStage.requirements,
    score: llmJudgeStage.score,
    outputFiles: generatedFiles.map((file) => file.path),
    judgeSessionArtifactPath: undefined as string | undefined,
  }

  if (options.cliOptions.debug) {
    await writeDebugArtifacts(
      options.outputDirectories.runDirectory,
      manifestEval.evalId,
      prompt,
      llmJudgeStage
    )
  }

  const resultFileName = `${sanitizeSegment(stageResult.evalId)}.json`
  const resultSubdirectory = getEvalResultSubdirectory(manifestEval.generatedPath)
  const resultDirectory = path.join(
    options.outputDirectories.evalDirectory,
    resultSubdirectory
  )
  await mkdir(resultDirectory, { recursive: true })

  const judgeSessionArtifactPath = llmJudgeStage.opencodeSession
    ? path.join(
        resultDirectory,
        `${sanitizeSegment(stageResult.evalId)}.opencode-session.judge.json`
      )
    : undefined

  if (judgeSessionArtifactPath) {
    await writeFile(
      judgeSessionArtifactPath,
      JSON.stringify(llmJudgeStage.opencodeSession, null, 2),
      'utf8'
    )
  }

  stageResult.judgeSessionArtifactPath = judgeSessionArtifactPath
    ? toPosixRelativePath(options.outputDirectories.runDirectory, judgeSessionArtifactPath)
    : undefined

  await writeFile(
    path.join(resultDirectory, resultFileName),
    JSON.stringify(stageResult, null, 2),
    'utf8'
  )

  const position = options.index + 1
  console.log(
    `[${position}/${options.total}] ${manifestEval.evalId} ` +
      `-> llm:${stageResult.score.ratio}`
  )

  return stageResult
}

async function runWithRetries<T>(
  task: () => Promise<T>,
  maxRetries: number,
  onRetry: (attempt: number, error: unknown) => void
) {
  const maxAttempts = maxRetries + 1

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error
      }

      onRetry(attempt, error)
    }
  }

  throw new Error('unexpected retry flow')
}

/*
  Runs LLM judging only (no generation), validates the input manifest from
  `runner/run.ts`, and writes per-eval judge outputs plus aggregate summary.
*/
export async function runJudgeEntry(argv: string[] = Bun.argv.slice(2)) {
  const cliOptions = parseJudgeCliArgs(argv)
  const skipEvalIdSet = new Set(cliOptions.skipEvalIds)
  const inputDirectory = path.resolve(process.cwd(), cliOptions.input)
  const outputDirectory = cliOptions.output ?? path.dirname(inputDirectory)
  const outputDirectories = await createRunOutputDirectories(outputDirectory)
  const generationManifest = await readGenerationManifest(inputDirectory)
  const manifestEvals = generationManifest.evals

  console.log(`judge output: ${toRelativePath(outputDirectories.runDirectory)}`)
  const rerunMissingJudgements = cliOptions.rerunMissingJudgements
  const rerunRequirementId = cliOptions.rerunRequirementId
  const rerunRequirementsFile = cliOptions.rerunRequirementsFile

  if (rerunMissingJudgements) {
    const missingManifestEvals: ManifestEval[] = []

    for (const manifestEval of manifestEvals) {
      const resultFilePath = getResultFilePath(
        outputDirectories.runDirectory,
        manifestEval.generatedPath,
        manifestEval.evalId
      )

      try {
        await readFile(resultFilePath, 'utf8')
      } catch (error) {
        if (isNotFoundError(error)) {
          missingManifestEvals.push(manifestEval)
          continue
        }

        throw error
      }
    }

    console.log(
      `rerunning missing judgements: ${missingManifestEvals.length} eval(s)`
    )

    const evalRuns = await runWithConcurrency(
      missingManifestEvals,
      cliOptions.concurrency,
      async (manifestEval, index) => {
        try {
          const stageResult = await runJudgeForManifestEval({
            manifestEval,
            index,
            total: missingManifestEvals.length,
            cliOptions,
            inputDirectory,
            outputDirectories,
            solverModel: generationManifest.solverModel,
          })

          return { kind: 'success' as const, index, result: stageResult }
        } catch (error) {
          const errorMessage = formatUnknownError(error)
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

    const { errorRuns } = partitionEvalRuns(evalRuns)
    if (errorRuns.length > 0) {
      console.log(
        `missing-judgement rerun completed with ${errorRuns.length} error(s)`
      )
    }

    const summaryBackupPath = await backupExistingSummary(outputDirectories.runDirectory)
    if (summaryBackupPath) {
      console.log(`summary backup: ${toRelativePath(summaryBackupPath)}`)
    }

    const summaryPayload = await rebuildSummaryFromExistingResults({
      runDirectory: outputDirectories.runDirectory,
      inputDirectory,
      generationManifest,
      judgeModel: cliOptions.model,
    })
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

  if (rerunRequirementsFile) {
    const targetRequirementsPath = path.resolve(
      process.cwd(),
      rerunRequirementsFile
    )
    const manifestEval = manifestEvals.find((item) => {
      const candidateRequirementsPath = path.resolve(
        process.cwd(),
        item.evalPath,
        'requirements.yaml'
      )

      return candidateRequirementsPath === targetRequirementsPath
    })

    if (!manifestEval) {
      throw new Error(
        `could not map --rerun-requirements-file=${toRelativePath(
          targetRequirementsPath
        )} to an eval in input manifest`
      )
    }

    if (rerunRequirementId) {
      console.log(
        `rerunning one requirement: ${manifestEval.evalId}#${rerunRequirementId}`
      )
    } else {
      console.log(`rerunning all requirements: ${manifestEval.evalId}`)
    }

    const evalDirectory = path.resolve(process.cwd(), manifestEval.evalPath)
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

    const packageJson = await loadFile(path.join(process.cwd(), 'testbench/package.json'))

    const llmJudgeStage = await runWithRetries(
      () =>
        runLlmJudgeStage([packageJson, ...generatedFiles], requirements, {
          ...cliOptions,
          directory: process.cwd(),
          requirementIds: rerunRequirementId ? [rerunRequirementId] : undefined,
        }),
      cliOptions.maxRetries,
      (attempt, error) => {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(
          `[judge-stage][${manifestEval.evalId}] attempt ${attempt}/${cliOptions.maxRetries} failed: ${errorMessage}`
        )
      }
    )

    const resultFilePath = getResultFilePath(
      outputDirectories.runDirectory,
      manifestEval.generatedPath,
      manifestEval.evalId
    )

    let existingEvalResult: PersistedEvalResult
    try {
      const raw = await readFile(resultFilePath, 'utf8')
      existingEvalResult = parsePersistedEvalResult(raw, resultFilePath)
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new Error(
          `missing existing per-eval output at ${toRelativePath(resultFilePath)}`
        )
      }
      throw error
    }

    let updatedRequirements: RequirementResult[]
    if (rerunRequirementId) {
      const rerunRequirement = llmJudgeStage.requirements[0]
      if (!rerunRequirement) {
        throw new Error(
          `judge did not return a requirement result for ${rerunRequirementId}`
        )
      }

      const matchingIndex = existingEvalResult.llmJudgeRequirements.findIndex(
        (item) => item.id === rerunRequirement.id
      )
      if (matchingIndex === -1) {
        throw new Error(
          `existing per-eval output does not contain requirement id ${rerunRequirement.id}`
        )
      }

      updatedRequirements = [...existingEvalResult.llmJudgeRequirements]
      updatedRequirements[matchingIndex] = rerunRequirement
    } else {
      updatedRequirements = llmJudgeStage.requirements
    }

    const judgeSessionArtifactPath = llmJudgeStage.opencodeSession
      ? path.join(
          path.dirname(resultFilePath),
          `${sanitizeSegment(existingEvalResult.evalId)}.opencode-session.judge.json`
        )
      : undefined

    if (judgeSessionArtifactPath) {
      await writeFile(
        judgeSessionArtifactPath,
        JSON.stringify(llmJudgeStage.opencodeSession, null, 2),
        'utf8'
      )
    }

    const updatedEvalResult: PersistedEvalResult = {
      ...existingEvalResult,
      judgeModel: cliOptions.model,
      solverModel: generationManifest.solverModel,
      llmJudgeRequirements: updatedRequirements,
      score: computeScore(updatedRequirements),
      outputFiles:
        existingEvalResult.outputFiles && existingEvalResult.outputFiles.length > 0
          ? existingEvalResult.outputFiles
          : generatedFiles.map((file) => file.path),
      judgeSessionArtifactPath: judgeSessionArtifactPath
        ? toPosixRelativePath(
            outputDirectories.runDirectory,
            judgeSessionArtifactPath
          )
        : existingEvalResult.judgeSessionArtifactPath,
    }

    await writeFile(resultFilePath, JSON.stringify(updatedEvalResult, null, 2), 'utf8')

    if (cliOptions.debug) {
      await writeDebugArtifacts(
        outputDirectories.runDirectory,
        manifestEval.evalId,
        prompt,
        llmJudgeStage
      )
    }

    const summaryBackupPath = await backupExistingSummary(outputDirectories.runDirectory)
    if (summaryBackupPath) {
      console.log(`summary backup: ${toRelativePath(summaryBackupPath)}`)
    }

    const summaryPayload = await rebuildSummaryFromExistingResults({
      runDirectory: outputDirectories.runDirectory,
      inputDirectory,
      generationManifest,
      judgeModel: cliOptions.model,
    })
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

  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  console.log(`starting judge: ${manifestEvals.length} eval(s)`)

  const evalRuns = await runWithConcurrency(
    manifestEvals,
    cliOptions.concurrency,
    async (manifestEval, index) => {
      try {
        if (skipEvalIdSet.has(manifestEval.evalId)) {
          const resultFilePath = getResultFilePath(
            outputDirectories.runDirectory,
            manifestEval.generatedPath,
            manifestEval.evalId
          )

          try {
            const raw = await readFile(resultFilePath, 'utf8')
            const parsed = parsePersistedEvalResult(raw, resultFilePath)
            const position = index + 1
            console.log(
              `[${position}/${manifestEvals.length}] ${manifestEval.evalId} ` +
                `-> llm:${parsed.score.ratio} (reused prior judge output)`
            )

            return { kind: 'success' as const, index, result: parsed }
          } catch (error) {
            if (isNotFoundError(error)) {
              throw new Error(
                `missing judge output for skipped eval ${manifestEval.evalId} at ` +
                  `${toRelativePath(resultFilePath)}`
              )
            }

            throw error
          }
        }

        const stageResult = await runJudgeForManifestEval({
          manifestEval,
          index,
          total: manifestEvals.length,
          cliOptions,
          inputDirectory,
          outputDirectories,
          solverModel: generationManifest.solverModel,
        })

        return { kind: 'success' as const, index, result: stageResult }
      } catch (error) {
        const errorMessage = formatUnknownError(error)
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
    console.error(formatUnknownError(error))
    process.exit(1)
  }
}
