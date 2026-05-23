import { createServer } from 'node:net'
import { access } from 'node:fs/promises'
import { describe, expect, test } from 'bun:test'

import {
  allocateHostPort,
  cleanupOpencodeTempDir,
  createOpencodeTempDir,
  DEFAULT_OPENCODE_PORT,
} from './opencode'

describe('opencode temp workspace', () => {
  test('creates and cleans up a temp directory', async () => {
    const workspace = await createOpencodeTempDir()

    expect(workspace.includes('evals-opencode-')).toBe(true)
    await access(workspace)

    await cleanupOpencodeTempDir(workspace)

    await expect(access(workspace)).rejects.toThrow()
  })
})

describe('opencode port allocation', () => {
  test('allocates a dynamic port when no preference is provided', async () => {
    const port = await allocateHostPort()
    expect(port).toBeGreaterThan(0)
  })

  test('returns preferred port when available', async () => {
    const probe = createServer()
    const preferredPort = await new Promise<number>((resolve, reject) => {
      probe.once('error', reject)
      probe.listen(0, '127.0.0.1', () => {
        const address = probe.address()
        if (!address || typeof address === 'string') {
          reject(new Error('expected tcp server address'))
          return
        }
        resolve(address.port)
      })
    })

    await new Promise<void>((resolve, reject) => {
      probe.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })

    expect(await allocateHostPort(preferredPort)).toBe(preferredPort)
  })

  test('falls back when preferred port is busy', async () => {
    const blocker = createServer()
    await new Promise<void>((resolve, reject) => {
      blocker.once('error', reject)
      blocker.listen(0, '127.0.0.1', () => resolve())
    })

    const address = blocker.address()
    if (!address || typeof address === 'string') {
      throw new Error('expected tcp server address')
    }

    try {
      const port = await allocateHostPort(address.port)
      expect(port).not.toBe(address.port)
      expect(port).toBeGreaterThan(0)
    } finally {
      await new Promise<void>((resolve, reject) => {
        blocker.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    }
  })

  test('uses the default port when explicitly preferred and free', async () => {
    const probe = createServer()
    const defaultPortAvailable = await new Promise<boolean>((resolve) => {
      probe.once('error', () => resolve(false))
      probe.listen(DEFAULT_OPENCODE_PORT, '127.0.0.1', () => {
        probe.close(() => resolve(true))
      })
    })

    if (!defaultPortAvailable) {
      const port = await allocateHostPort(DEFAULT_OPENCODE_PORT)
      expect(port).not.toBe(DEFAULT_OPENCODE_PORT)
      return
    }

    expect(await allocateHostPort(DEFAULT_OPENCODE_PORT)).toBe(
      DEFAULT_OPENCODE_PORT
    )
  })
})
