import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'

let serverPromise: ReturnType<typeof createOpencodeServer> | undefined

/*
  Starts one reusable OpenCode server process for solver and judge stages.
*/
export async function ensureOpencodeServerStarted({
  port,
  timeout = 120000,
}: {
  port?: number
  timeout?: number
}) {
  if (!serverPromise) {
    // Keep the resolved server handle alive for the process lifetime.
    serverPromise = createOpencodeServer({
      port,
      timeout,
    })
  }

  await serverPromise
}
