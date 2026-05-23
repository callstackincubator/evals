import {
  OpencodeClientManager,
  OpencodeLanguageModel,
} from 'ai-sdk-provider-opencode-sdk'

type CreateIsolatedOpencodeModelOptions = {
  port: number
  cwd?: string
  createNewSession?: boolean
}

/*
  Creates an OpenCode language model bound to one server URL.

  The ai-sdk-provider-opencode-sdk client manager is a process singleton;
  concurrent docker containers each need their own manager instance.
*/
export function createIsolatedOpencodeModel(
  modelId: string,
  options: CreateIsolatedOpencodeModelOptions
) {
  const clientManager = new OpencodeClientManager({
    baseUrl: `http://127.0.0.1:${options.port}`,
    autoStartServer: false,
    cwd: options.cwd,
  })

  const model = new OpencodeLanguageModel({
    modelId,
    settings: {
      createNewSession: options.createNewSession ?? true,
      cwd: options.cwd,
    },
    clientManager,
  })

  return {
    model,
    async dispose() {
      await clientManager.dispose()
    },
  }
}
