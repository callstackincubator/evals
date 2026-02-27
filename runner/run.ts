import { parseArgs as parseArgv } from 'node:util'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  getGenerationManifestPath,
  stringifyGenerationManifest,
  type GenerationManifest,
} from './utils/generation-manifest'
import { runWithConcurrency } from './solver/concurrency'
import { materializeFiles } from './solver'
import { runSolverStage } from './solver/pipeline'
import { discoverEvals } from './utils/discovery'
import { partitionEvalRuns } from './utils/eval-runs'
import { loadFiles, sanitizeSegment } from './utils/fs'
import { normalizeModelId } from './utils/model'

function parsePositiveInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${flagName} must be a positive integer`)
  }

  return parsedValue
}

function parseRunCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'concurrency': { type: 'string', default: '4' },
      'fail-fast': { type: 'boolean', default: false },
      'model': { type: 'string' },
      'pattern': { type: 'string', default: 'evals/**/*' },
      'timeout': { type: 'string', default: '120000' },
      'port': { type: 'string' },
      'output': { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  })

  if (!values.model) {
    throw new Error('--model is required for generation runs')
  }

  return {
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    debug: false,
    failFast: values['fail-fast'] ?? false,
    model: normalizeModelId(values.model) ?? values.model,
    solverModel: normalizeModelId(values.model) ?? values.model,
    pattern: values.pattern,
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: values.port ? parsePositiveInteger(values.port, '--port') : undefined,
    output: values.output,
  }
}

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
        const [appFiles, referenceFiles, prompt] = await Promise.all([
          loadFiles(path.join(evalItem.evalPath, 'app')),
          loadFiles(path.join(evalItem.evalPath, 'reference')).catch(() => []),
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
                  referenceFiles.map(
                    (file) => ({
                      path: file.path,
                      content: file.content,
                    })
                  )
                ),
              }
            : await runSolverStage(prompt, appFiles, referenceFiles, generatedEvalRunDirectory, cliOptions)

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
