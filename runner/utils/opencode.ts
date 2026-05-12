import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'

let serverPromise: Promise<void> | undefined

const DEFAULT_PORT = 4096

async function isServerAlive(port: number): Promise<boolean> {
  const base = `http://127.0.0.1:${port}`
  try {
    const res = await fetch(`${base}/global/health`, {
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}

function buildProviderConfig() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return undefined
  }
  return {
    provider: {
      anthropic: { apiKey: anthropicKey },
    },
  }
}

/*
  Starts one reusable OpenCode server process for solver and judge stages.
  If a server is already listening on the target port it is reused as-is.
*/
export async function ensureOpencodeServerStarted({
  port = DEFAULT_PORT,
  timeout = 120000,
}: {
  port?: number,
  timeout?: number,
}) {
  if (!serverPromise) {
    serverPromise = (async () => {
      if (await isServerAlive(port)) {
        return
      }
      await createOpencodeServer({
        port,
        timeout,
        config: buildProviderConfig(),
      })
    })()
  }

  await serverPromise
}
