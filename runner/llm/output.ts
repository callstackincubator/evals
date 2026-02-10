import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { RequirementResult } from './utils'

export type EvalResult = {
  runId: string
  evalId: string
  evalPath: string
  judgeModel: string
  requirementsPath: string
  inputFiles: string[]
  requirementResults: RequirementResult[]
  score: {
    passedWeight: number
    totalWeight: number
    ratio: number
  }
  errors: string[]
  summary?: string
  promptPath?: string
  judgeOutputPath?: string
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function toRelativePath(value: string): string {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

/*
  Creates run output directories and returns absolute paths used by writers.
 */
export async function createRunOutputDirectories(outputDir: string, runId: string) {
  const runDirectory = path.resolve(process.cwd(), outputDir, runId)
  await mkdir(runDirectory, { recursive: true })

  const evalDirectory = path.join(runDirectory, 'evals')
  await mkdir(evalDirectory, { recursive: true })

  return {
    runDirectory,
    evalDirectory,
  }
}

/*
  Writes one eval result artifact and returns its index entry for summary.json.
 */
export async function writePerEvalResult(evalDirectory: string, result: EvalResult) {
  const fileName = `${sanitizeSegment(result.evalId)}.json`
  const absolutePath = path.join(evalDirectory, fileName)

  await writeFile(absolutePath, JSON.stringify(result, null, 2), 'utf8')

  return {
    evalId: result.evalId,
    path: toRelativePath(absolutePath),
    scoreRatio: result.score.ratio,
  }
}

/*
  Writes debug artifacts for a single eval run when debug mode is enabled.
 */
export async function writeDebugArtifacts(
  runDirectory: string,
  evalId: string,
  prompt: string,
  rawOutput: unknown,
) {
  const debugDirectory = path.join(runDirectory, 'debug', sanitizeSegment(evalId))
  await mkdir(debugDirectory, { recursive: true })

  const promptPath = path.join(debugDirectory, 'judge-prompt.txt')
  const judgeOutputPath = path.join(debugDirectory, 'judge-output.json')

  await writeFile(promptPath, prompt, 'utf8')
  await writeFile(judgeOutputPath, JSON.stringify(rawOutput, null, 2), 'utf8')

  return {
    promptPath: toRelativePath(promptPath),
    judgeOutputPath: toRelativePath(judgeOutputPath),
  }
}

/*
  Writes aggregate run summary and returns relative path to summary.json.
 */
export async function writeSummary(runDirectory: string, summary: unknown) {
  const summaryPath = path.join(runDirectory, 'summary.json')
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8')
  return toRelativePath(summaryPath)
}
