import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'

let serverPromise: Promise<void> | undefined

/*
  Starts one reusable OpenCode server process for solver and judge stages.
*/
export async function ensureOpencodeServerStarted({
  port, 
  timeout = 120000
}: {
  port?: number,
  timeout?: number,
}) {
  if (!serverPromise) {
    serverPromise = (async () => {
      await createOpencodeServer({
        port,
        timeout,
      })
    })()
  }

  await serverPromise
}
