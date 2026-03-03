import { createConnection } from 'node:net'

import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'

let serverPromise: Promise<void> | undefined

function isPortInUse(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection(port, host, () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
  })
}

/*
  Starts one reusable OpenCode server process for solver and judge stages.
  Skips starting if the port is already in use (e.g. opencode serve from bench-series).
*/
export async function ensureOpencodeServerStarted({
  port,
  timeout = 120000,
}: {
  port?: number
  timeout?: number
}) {
  const portToUse = port ?? 4096
  if (await isPortInUse(portToUse)) {
    return
  }
  if (!serverPromise) {
    serverPromise = (async () => {
      await createOpencodeServer({
        port: portToUse,
        timeout,
      })
    })()
  }
  await serverPromise
}
