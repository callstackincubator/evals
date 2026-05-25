import { createServer } from 'node:net'
import { access } from 'node:fs/promises'
import { afterEach, describe, expect, test } from 'bun:test'

import {
  allocateHostPort,
  cleanupOpencodeTempDir,
  createOpencodeTempDir,
  DEFAULT_OPENCODE_PORT,
  forceStopEvalsOpencodeContainersSync,
  formatContainerLogLine,
  shouldPassthroughOpencodeDockerEnvKey,
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

describe('opencode container log formatting', () => {
  test('prefixes container log lines with the opencode docker tag', () => {
    expect(formatContainerLogLine('server ready')).toBe(
      '[opencode-docker][global][container] server ready'
    )
  })
})

describe('opencode container shutdown', () => {
  test('force stop returns zero when no eval containers are listed', () => {
    expect(forceStopEvalsOpencodeContainersSync('test')).toBe(0)
  })
})

describe('opencode docker env passthrough', () => {
  const originalExtraPrefixes = process.env.OPENCODE_DOCKER_EXTRA_ENV_PREFIXES

  test('registers interrupt handlers before ai-sdk-provider-opencode-sdk', async () => {
    await import('ai-sdk-provider-opencode-sdk')

    const listeners = process.rawListeners('SIGINT')
    expect(listeners.length).toBeGreaterThanOrEqual(2)
    expect(String(listeners[0])).toContain('handleSignal')
    expect(String(listeners.at(-1))).toContain('cleanup')
  })

  test('passes worker required env vars through to containers', () => {
    expect(shouldPassthroughOpencodeDockerEnvKey('AI_GATEWAY_API_KEY')).toBe(
      true
    )
    expect(shouldPassthroughOpencodeDockerEnvKey('CLOUDFLARE_API_TOKEN')).toBe(
      true
    )
    expect(
      shouldPassthroughOpencodeDockerEnvKey('CLOUDFLARE_ACCOUNT_ID')
    ).toBe(true)
    expect(
      shouldPassthroughOpencodeDockerEnvKey('CLOUDFLARE_GATEWAY_ID')
    ).toBe(true)
  })

  test('passes provider-prefixed env vars through to containers', () => {
    expect(shouldPassthroughOpencodeDockerEnvKey('OPENAI_API_KEY')).toBe(true)
    expect(shouldPassthroughOpencodeDockerEnvKey('ANTHROPIC_API_KEY')).toBe(
      true
    )
    expect(shouldPassthroughOpencodeDockerEnvKey('OPENCODE_SERVER_LOG_LEVEL')).toBe(
      true
    )
  })

  test('does not pass unrelated env vars through to containers', () => {
    expect(shouldPassthroughOpencodeDockerEnvKey('PATH')).toBe(false)
    expect(shouldPassthroughOpencodeDockerEnvKey('HOME')).toBe(false)
    expect(shouldPassthroughOpencodeDockerEnvKey('GITHUB_TOKEN')).toBe(false)
  })

  afterEach(() => {
    if (originalExtraPrefixes === undefined) {
      delete process.env.OPENCODE_DOCKER_EXTRA_ENV_PREFIXES
      return
    }

    process.env.OPENCODE_DOCKER_EXTRA_ENV_PREFIXES = originalExtraPrefixes
  })
})
