import net from 'node:net'

async function canBindPort(port: number, host = '127.0.0.1') {
  return await new Promise<boolean>((resolve) => {
    const server = net.createServer()
    server.unref()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen({
      port,
      host,
      exclusive: true,
    })
  })
}

export async function chooseAvailablePort(preferredPort: number, attempts = 20) {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = preferredPort + offset
    if (candidate > 65535) {
      break
    }

    if (await canBindPort(candidate)) {
      return candidate
    }
  }

  throw new Error(
    `Could not find a free OpenCode port starting from ${preferredPort} (checked ${attempts} ports)`
  )
}
