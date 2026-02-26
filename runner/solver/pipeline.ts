import type { CliOptions } from 'runner/config'
import { materializeFiles, runSolver } from './index'
import { type LoadedFile } from 'runner/utils/fs'

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
  if (!options.solverModel) {
    return {
      files: await materializeFiles(workingDir, referenceFiles),
      summary: 'solver skipped: using baseline as a reference',
    }
  }

  const result = await runSolver({
    model: options.solverModel,
    timeout: options.timeout,
    port: options.port,
    prompt,
    files,
    workingDirectory: workingDir,
  })

  return {
    summary: result.summary,
    files: await materializeFiles(workingDir, result.files),
  }
}
