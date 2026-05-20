import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'

let serverPromise: Promise<void> | undefined

async function isPortInUse(port: number): Promise<boolean> {
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
  Skips starting if the port is already in use (e.g. opencode serve from bench-series).
*/
export async function ensureOpencodeServerStarted({
  port,
  timeout = 120000,
}: {
  port: number
  timeout?: number
}) {
  if (await isPortInUse(port)) {
    return
  }
  if (!serverPromise) {
    serverPromise = (async () => {
      await createOpencodeServer({
        port: port,
        timeout,
      })
    })()
  }
  await serverPromise
}
