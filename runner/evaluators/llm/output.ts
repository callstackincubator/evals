import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { sanitizeSegment } from 'runner/utils/fs'

/*
  Creates run output directories and returns absolute paths used by writers.
 */
export async function createRunOutputDirectories(
  runDirectory: string
) {
  const resolvedRunDirectory = path.resolve(process.cwd(), runDirectory)
  await mkdir(resolvedRunDirectory, { recursive: true })

  const evalDirectory = path.join(resolvedRunDirectory, 'evals')
  await mkdir(evalDirectory, { recursive: true })

  return {
    runDirectory: resolvedRunDirectory,
    evalDirectory,
  }
}

/*
  Writes debug artifacts for a single eval run when debug mode is enabled.
 */
export async function writeDebugArtifacts(
  runDirectory: string,
  evalId: string,
  prompt: string,
  rawOutput: unknown
) {
  const debugDirectory = path.join(
    runDirectory,
    'debug',
    sanitizeSegment(evalId)
  )
  await mkdir(debugDirectory, { recursive: true })

  const promptPath = path.join(debugDirectory, 'judge-prompt.txt')
  const judgeOutputPath = path.join(debugDirectory, 'judge-output.json')

  await writeFile(promptPath, prompt, 'utf8')
  await writeFile(judgeOutputPath, JSON.stringify(rawOutput, null, 2), 'utf8')

  return {
    promptPath,
    judgeOutputPath,
  }
}

/*
  Writes aggregate run summary and returns relative path to summary.json.
 */
export async function writeSummary(runDirectory: string, summary: unknown) {
  const summaryPath = path.join(runDirectory, 'summary.json')
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8')
  return summaryPath
}
