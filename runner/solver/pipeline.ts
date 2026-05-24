import { materializeFiles, runSolver } from './index'
import type { LoadedFile } from 'runner/utils/fs'
import {
  cleanupOpencodeTempDir,
  createOpencodeTempDir,
  runWithOpencodeDockerServer,
} from 'runner/utils/opencode'
import { materializeSolverWorkspace } from 'runner/utils/opencode-workspace'

type SolverStageOptions = {
  solverModel: string
  timeout: number
  port?: number
  agentLogs?: boolean
}

/*
  Runs solver generation for one discovered eval.
*/
export async function runSolverStage(
  prompt: string,
  files: LoadedFile[],
  outputDir: string,
  options: SolverStageOptions
) {
  const hostWorkspace = await createOpencodeTempDir()

  try {
    await materializeSolverWorkspace(hostWorkspace, prompt, files)

    return await runWithOpencodeDockerServer(
      {
        hostWorkspace,
        timeout: options.timeout,
        port: options.port,
        agentLogs: options.agentLogs,
      },
      async (server) => {
        const result = await runSolver({
          model: options.solverModel,
          timeout: options.timeout,
          port: server.port,
          prompt,
          files,
          workingDirectory: server.containerWorkspace,
        })

        return {
          summary: result.summary,
          opencodeSession: result.opencodeSession,
          files: await materializeFiles(outputDir, result.files),
        }
      }
    )
  } finally {
    await cleanupOpencodeTempDir(hostWorkspace)
  }
}
