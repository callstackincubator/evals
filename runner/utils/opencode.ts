import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { OpencodeClientManager } from 'ai-sdk-provider-opencode-sdk'

const MINIMAL_AGENT_PROMPT =
  'You are a concise model adapter. Do not use tools. Return only the requested result.'

const OPENCODE_SERVER_CONFIG = {
  default_agent: 'general',
  agent: {
    general: {
      prompt: MINIMAL_AGENT_PROMPT,
      steps: 1,
    },
    build: {
      prompt: MINIMAL_AGENT_PROMPT,
      steps: 1,
    },
    plan: {
      prompt: MINIMAL_AGENT_PROMPT,
      steps: 1,
    },
    explore: {
      prompt: MINIMAL_AGENT_PROMPT,
      steps: 1,
    },
    summary: {
      prompt: MINIMAL_AGENT_PROMPT,
      steps: 1,
    },
  },
} as const

export const OPENCODE_NO_TOOLS = {
  invalid: false,
  question: false,
  bash: false,
  read: false,
  write: false,
  edit: false,
  multiedit: false,
  multi_edit: false,
  glob: false,
  grep: false,
  task: false,
  webfetch: false,
  websearch: false,
  todowrite: false,
  skill: false,
  apply_patch: false,
} as const

type OpencodeServerHandle = {
  url: string
  close(): void
}

let serverPromise: Promise<OpencodeServerHandle> | undefined
let serverHandle: OpencodeServerHandle | undefined
let minimalServerConfigEnabled = true

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function getRunnerOpencodePaths() {
  const root = process.env.EVALS_OPENCODE_HOME ?? '/tmp/evals-opencode-home'

  return {
    root,
    configHome: path.join(root, '.config'),
    dataHome: path.join(root, '.local', 'share'),
    cacheHome: path.join(root, '.cache'),
    stateHome: path.join(root, '.local', 'state'),
    configDir: path.join(root, '.config', 'opencode'),
  }
}

function ensureRunnerOpencodeDirectories() {
  const paths = getRunnerOpencodePaths()
  for (const value of Object.values(paths)) {
    mkdirSync(value, { recursive: true })
  }
  return paths
}

function buildOpencodeServerEnv(configContent?: string) {
  const runnerPaths =
    process.env.EVALS_OPENCODE_USE_USER_XDG === '1'
      ? null
      : ensureRunnerOpencodeDirectories()

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    // OpenCode 1.2.x can fail hard at startup when it cannot reach models.dev.
    // The binary embeds a model snapshot, so use it and skip network fetch by default.
    OPENCODE_DISABLE_MODELS_FETCH:
      process.env.OPENCODE_DISABLE_MODELS_FETCH ?? '1',
    // These reduce startup-time network/dependency churn and are safe for runner usage.
    OPENCODE_DISABLE_LSP_DOWNLOAD:
      process.env.OPENCODE_DISABLE_LSP_DOWNLOAD ?? '1',
    OPENCODE_DISABLE_AUTOUPDATE: process.env.OPENCODE_DISABLE_AUTOUPDATE ?? '1',
    OPENCODE_DISABLE_PROJECT_CONFIG:
      process.env.OPENCODE_DISABLE_PROJECT_CONFIG ?? '1',
    OPENCODE_DISABLE_EXTERNAL_SKILLS:
      process.env.OPENCODE_DISABLE_EXTERNAL_SKILLS ?? '1',
    OPENCODE_DISABLE_CLAUDE_CODE:
      process.env.OPENCODE_DISABLE_CLAUDE_CODE ?? '1',
    OPENCODE_DISABLE_SHARE: process.env.OPENCODE_DISABLE_SHARE ?? '1',
  }

  if (runnerPaths) {
    env.XDG_CONFIG_HOME = runnerPaths.configHome
    env.XDG_DATA_HOME = runnerPaths.dataHome
    env.XDG_CACHE_HOME = runnerPaths.cacheHome
    env.XDG_STATE_HOME = runnerPaths.stateHome
    env.OPENCODE_CONFIG_DIR = runnerPaths.configDir
  }

  if (configContent !== undefined) {
    env.OPENCODE_CONFIG_CONTENT = configContent
  } else {
    delete env.OPENCODE_CONFIG_CONTENT
  }

  return env
}

async function canConnectToPort(
  port: number,
  host = '127.0.0.1',
  timeoutMs = 500
) {
  return await new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ port, host })
    let settled = false

    const finish = (value: boolean) => {
      if (settled) {
        return
      }
      settled = true
      socket.destroy()
      resolve(value)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

async function startOpencodeServerProcess({
  port,
  timeout,
  config,
}: {
  port?: number
  timeout: number
  config?: unknown
}): Promise<OpencodeServerHandle> {
  const hostname = '127.0.0.1'
  const resolvedPort = port ?? 4096
  const args = ['serve', `--hostname=${hostname}`, `--port=${resolvedPort}`]
  const proc = spawn('opencode', args, {
    env: buildOpencodeServerEnv(
      config === undefined ? undefined : JSON.stringify(config)
    ),
  })

  const url = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for server to start after ${timeout}ms`))
    }, timeout)

    let output = ''
    let settled = false

    const finishReject = (error: Error) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      reject(error)
    }

    const finishResolve = (value: string) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      resolve(value)
    }

    proc.stdout?.on('data', (chunk) => {
      const text = chunk.toString()
      output += text
      for (const line of output.split('\n')) {
        if (!line.startsWith('opencode server listening')) {
          continue
        }

        const match = line.match(/on\s+(https?:\/\/[^\s]+)/)
        const url = match?.[1]
        if (!url) {
          finishReject(new Error(`Failed to parse server url from output: ${line}`))
          return
        }

        finishResolve(url)
        return
      }
    })

    proc.stderr?.on('data', (chunk) => {
      output += chunk.toString()
    })

    proc.on('error', (error) => {
      finishReject(error)
    })

    proc.on('exit', (code) => {
      let message = `Server exited with code ${code}`
      if (output.trim()) {
        message += `\nServer output: ${output}`
      }
      finishReject(new Error(message))
    })
  })

  return {
    url,
    close() {
      proc.kill()
    },
  }
}

async function createOpencodeServerWithFallback({
  port,
  timeout,
}: {
  port?: number
  timeout?: number
}) {
  const resolvedTimeout = timeout ?? 120000
  const baseOptions = {
    port,
    timeout: resolvedTimeout,
  }
  const shouldSkipInjectedConfig = process.env.EVALS_OPENCODE_USE_USER_XDG === '1'

  if (shouldSkipInjectedConfig || !minimalServerConfigEnabled) {
    try {
      return await startOpencodeServerProcess(baseOptions)
    } catch (error) {
      const canReuseExisting =
        typeof port === 'number' &&
        /failed to start server on port/i.test(getErrorMessage(error)) &&
        (await canConnectToPort(port))

      if (canReuseExisting) {
        return {
          url: `http://127.0.0.1:${port}`,
          close() {},
        }
      }

      throw error
    }
  }

  try {
    return await startOpencodeServerProcess({
      ...baseOptions,
      config: OPENCODE_SERVER_CONFIG,
    })
  } catch (error) {
    // OpenCode 1.2.x can crash on some injected config shapes. Fall back to plain startup.
    minimalServerConfigEnabled = false
    try {
      return await startOpencodeServerProcess(baseOptions)
    } catch (fallbackError) {
      const canReuseExisting =
        typeof port === 'number' &&
        /failed to start server on port/i.test(getErrorMessage(fallbackError)) &&
        (await canConnectToPort(port))

      if (canReuseExisting) {
        return {
          url: `http://127.0.0.1:${port}`,
          close() {},
        }
      }

      throw fallbackError
    }
  }
}

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
    serverPromise = createOpencodeServerWithFallback({
      port,
      timeout,
    })
      .then((handle) => {
        serverHandle = handle
        return handle
      })
      .catch((error) => {
        // Allow a later call to retry startup if this attempt fails.
        serverPromise = undefined
        serverHandle = undefined
        throw error
      })
  }

  await serverPromise
}

export function isRecoverableOpencodeError(error: unknown) {
  const message = getErrorMessage(error)

  if (
    /insufficient_quota/i.test(message) ||
    /exceed_context_size_error/i.test(message) ||
    /available context size/i.test(message)
  ) {
    return false
  }

  return (
    /no output generated/i.test(message) ||
    /incorrect api key provided/i.test(message) ||
    /invalid_api_key/i.test(message) ||
    /providerautherror/i.test(message) ||
    /failed to fetch models\.dev/i.test(message) ||
    /failed to start server on port/i.test(message) ||
    /address already in use/i.test(message) ||
    /ECONNREFUSED/i.test(message) ||
    /ECONNRESET/i.test(message) ||
    /socket hang up/i.test(message)
  )
}

export async function restartOpencodeServer({
  port,
  timeout = 120000,
}: {
  port?: number
  timeout?: number
}) {
  try {
    serverHandle?.close()
  } catch {
    // Best-effort cleanup before restart.
  }

  serverPromise = undefined
  serverHandle = undefined

  try {
    OpencodeClientManager.resetInstance()
  } catch {
    // Reset is best-effort; startup will still retry below.
  }

  await ensureOpencodeServerStarted({ port, timeout })
}
