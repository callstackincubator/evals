import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'

let serverPromise: Promise<void> | undefined

async function isServerAlive(port: number): Promise<boolean> {
  const base = `http://127.0.0.1:${port}`
  try {
    const res = await fetch(`${base}/global/health`, {
      signal: AbortSignal.timeout(1500),
    })
    return res.ok
  } catch {
    return false
  }
}

/*
  Starts one reusable OpenCode server process for solver and judge stages.
  If a server is already listening on the target port it is reused as-is.
*/
export async function ensureOpencodeServerStarted({
  port,
  timeout = 120000,
}: {
  port: number
  timeout?: number
}) {
  if (!serverPromise) {
    serverPromise = (async () => {
      if (await isServerAlive(port)) {
        return
      }
      await createOpencodeServer({
        port,
        timeout,
      })
    })()
  }

  await serverPromise
}
