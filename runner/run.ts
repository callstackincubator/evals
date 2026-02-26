import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  getGenerationManifestPath,
  stringifyGenerationManifest,
  type GenerationManifest,
} from './utils/generation-manifest'
import { parseRunCliArgs } from './config'
import { runWithConcurrency } from './solver/concurrency'
import { materializeFiles } from './solver'
import { runSolverStage } from './solver/pipeline'
import { discoverEvals } from './utils/discovery'
import { partitionEvalRuns } from './utils/eval-runs'
import { loadFiles, sanitizeSegment } from './utils/fs'

function toRelativePath(value: string) {
  return path.relative(process.cwd(), value).split(path.sep).join('/')
}

/*
  Generates eval outputs only (no judging), writes files under the target output
  directory, and persists a validated manifest consumed by `runner/judge.ts`.
*/
export async function runGenerationEntry(argv: string[] = Bun.argv.slice(2)) {
  const cliOptions = parseRunCliArgs(argv)
  const discoveredEvals = await discoverEvals(cliOptions.pattern)
  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const startedAt = new Date().toISOString()
  const outputDirectory = path.resolve(
    process.cwd(),
    cliOptions.output ??
      path.join('generated', `${sanitizeSegment(cliOptions.model)}-${runId}`)
  )
  await mkdir(outputDirectory, { recursive: true })

  console.log(`starting generation: ${discoveredEvals.length} eval(s)`)

  const evalRuns = await runWithConcurrency(
    discoveredEvals,
    cliOptions.concurrency,
    async (evalItem, index) => {
      try {
        const [appFiles, prompt] = await Promise.all([
          loadFiles(path.join(evalItem.evalPath, 'app')),
          readFile(path.join(evalItem.evalPath, 'prompt.md'), 'utf-8'),
        ])

        const evalsRoot = path.resolve(process.cwd(), 'evals')
        const relativeToEvals = path.relative(evalsRoot, evalItem.evalPath)
        const generatedPath =
          relativeToEvals !== '' && !relativeToEvals.startsWith('..')
            ? relativeToEvals
            : path.relative(process.cwd(), evalItem.evalPath)
        const generatedEvalRunDirectory = path.join(outputDirectory, generatedPath)
        const solverStage =
          cliOptions.model === 'noop'
            ? {
                summary: 'Copied reference files',
                files: await materializeFiles(
                  generatedEvalRunDirectory,
                  (await loadFiles(path.join(evalItem.evalPath, 'reference'))).map(
                    (file) => ({
                      path: file.path,
                      content: file.content,
                    })
                  )
                ),
              }
            : await runSolverStage(prompt, appFiles, generatedEvalRunDirectory, {
                solverModel: cliOptions.model,
                timeout: cliOptions.timeout,
                port: cliOptions.port,
              })

        const position = index + 1
        console.log(
          `[${position}/${discoveredEvals.length}] ${evalItem.evalId} -> generated`
        )

        return {
          kind: 'success' as const,
          index,
          result: {
            evalId: evalItem.evalId,
            evalPath: toRelativePath(evalItem.evalPath),
            outputFiles: solverStage.files.map((file) => file.path),
            generatedPath,
          },
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        console.error(`[run-stage][${evalItem.evalId}] ${errorMessage}`)

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

  const manifestPayload: GenerationManifest = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    solverModel: cliOptions.model,
    pattern: cliOptions.pattern,
    evalCount: discoveredEvals.length,
    evalsProcessed: successfulRuns.length,
    evalsErrored: errorRuns.length,
    evals: successfulRuns.map((run) => run.result),
  }

  const manifestPath = getGenerationManifestPath(outputDirectory)
  await writeFile(manifestPath, stringifyGenerationManifest(manifestPayload), 'utf8')

  console.log(`generation complete: ${toRelativePath(outputDirectory)}`)
  console.log(`manifest: ${toRelativePath(manifestPath)}`)

  return {
    outputDirectory,
    manifestPath,
  }
}

if (import.meta.main) {
  try {
    await runGenerationEntry()
    process.exit(0)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
