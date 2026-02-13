import path from 'node:path'
import { cp } from 'node:fs/promises'

import type { CliOptions } from 'runner/config'
import { materializeFiles, runSolver } from './index'
import { type LoadedFile } from 'runner/utils/fs'

const SOLVER_TEMPLATE_DIRECTORY = path.resolve(
  process.cwd(),
  'runner',
  'solver',
  'template'
)

/*
  Runs solver generation for one discovered eval.
*/
export async function runSolverStage(
  prompt: string,
  files: LoadedFile[],
  referenceFiles: LoadedFile[],
  workingDir: string,
  options: CliOptions
) {
  await cp(SOLVER_TEMPLATE_DIRECTORY, workingDir, {
    recursive: true,
  })

  if (!options.solverModel) {
    return {
      files: await materializeFiles(
        workingDir,
        referenceFiles
      ),
      summary: 'solver skipped: using baseline as a reference',
    }
  }

  const result = await runSolver({
    model: options.solverModel,
    timeout: options.timeout,
    port: options.port,
    prompt,
    files,
  })

  return {
    summary: result.summary,
    files: await materializeFiles(
      workingDir,
      result.files
    ),
  }
}
