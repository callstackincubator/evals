import { materializeFiles, runSolver } from './index'
import { type LoadedFile } from 'runner/utils/fs'

type SolverStageOptions = {
  solverModel: string
  timeout: number
  port?: number
}

/*
  Runs solver generation for one discovered eval.
*/
export async function runSolverStage(
  prompt: string,
  files: LoadedFile[],
  workingDir: string,
  options: SolverStageOptions
) {
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
    opencodeSession: result.opencodeSession,
    files: await materializeFiles(
      workingDir,
      result.files
    ),
  }
}
