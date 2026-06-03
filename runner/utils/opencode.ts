import { spawn, spawnSync } from 'node:child_process'
import { AsyncLocalStorage } from 'node:async_hooks'
import { access, copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { createConnection, createServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import { startOpencodeAgentActivityLogging } from './opencode-agent-activity'
import {
  DEFAULT_OPENCODE_DOCKER_PASSTHROUGH_ENV_PREFIXES,
  DEFAULT_OPENCODE_PORT,
  OPENCODE_CONTAINER_WORKSPACE,
  OPENCODE_DOCKER_RUN_LABEL,
} from './opencode-constants'
import {
  configureOpencodeVerboseLogging,
  isOpencodeVerboseLoggingEnabled,
  logOpencodeTrace,
} from './opencode-trace'

export { DEFAULT_OPENCODE_PORT, OPENCODE_CONTAINER_WORKSPACE }

type OpencodeWorkerContext = {
  workerId: number
  workerCount: number
  taskLabel?: string
}

const opencodeWorkerContext = new AsyncLocalStorage<OpencodeWorkerContext>()
let agentActivityLoggingEnabled = false
let configuredHostTmpdir: string | undefined

const OPENCODE_TEMP_PREFIX = 'evals-opencode-'
const OPENCODE_HOME_PREFIX = 'evals-opencode-home-'
const OPENCODE_CONTAINER_NAME_PREFIX = 'evals-opencode-'
const DEFAULT_DOCKER_IMAGE = 'evals-opencode:latest'
const opencodeDockerRunId = randomUUID()
const DOCKER_SERVER_START_TIMEOUT_MS = 120_000
const DEFAULT_OPENCODE_SERVER_LOG_LEVEL = 'INFO'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildPassthroughEnvPattern(prefixes: readonly string[]) {
  return new RegExp(`^(${prefixes.map(escapeRegExp).join('|')})`)
}

const DEFAULT_PASSTHROUGH_ENV_PATTERN = buildPassthroughEnvPattern(
  DEFAULT_OPENCODE_DOCKER_PASSTHROUGH_ENV_PREFIXES
)

export function shouldPassthroughOpencodeDockerEnvKey(key: string) {
  return getPassthroughEnvPattern().test(key)
}

function getPassthroughEnvPattern() {
  const extraPrefixes = process.env.OPENCODE_DOCKER_EXTRA_ENV_PREFIXES
  if (!extraPrefixes) {
    return DEFAULT_PASSTHROUGH_ENV_PATTERN
  }

  const escapedPrefixes = extraPrefixes
    .split(',')
    .map((prefix) => prefix.trim())
    .filter(Boolean)
    .map(escapeRegExp)

  if (escapedPrefixes.length === 0) {
    return DEFAULT_PASSTHROUGH_ENV_PATTERN
  }

  return buildPassthroughEnvPattern([
    ...escapedPrefixes,
    ...DEFAULT_OPENCODE_DOCKER_PASSTHROUGH_ENV_PREFIXES,
  ])
}

function formatOpencodeLogTag(scope: 'auto' | 'global' = 'auto') {
  if (scope === 'global') {
    return '[opencode-docker][global]'
  }

  const context = opencodeWorkerContext.getStore()
  if (!context) {
    return '[opencode-docker][global]'
  }

  const taskSuffix = context.taskLabel ? `[${context.taskLabel}]` : ''
  return `[opencode-docker][worker ${context.workerId}/${context.workerCount}]${taskSuffix}`
}

function logOpencode(message: string, scope: 'auto' | 'global' = 'auto') {
  console.log(`${formatOpencodeLogTag(scope)} ${message}`)
}

function logOpencodeError(message: string, scope: 'auto' | 'global' = 'auto') {
  console.error(`${formatOpencodeLogTag(scope)} ${message}`)
}

export function logOpencodeWarn(
  message: string,
  scope: 'auto' | 'global' = 'auto'
) {
  console.warn(`${formatOpencodeLogTag(scope)} ${message}`)
}

export function logOpencodeAgent(message: string) {
  console.log(`${formatOpencodeLogTag('auto')}[agent] ${message}`)
}

export function configureOpencodeHostTmpdir(options: { hostTmpdir?: string }) {
  configuredHostTmpdir = options.hostTmpdir?.trim()
    ? path.resolve(options.hostTmpdir.trim())
    : undefined
}

export function configureOpencodeDockerLogging(options: {
  agentLogs?: boolean
  verbose?: boolean
}) {
  if (options.verbose !== undefined) {
    configureOpencodeVerboseLogging({ verbose: options.verbose })
  }

  if (options.agentLogs !== undefined) {
    agentActivityLoggingEnabled = options.agentLogs
  }

  if (options.verbose) {
    agentActivityLoggingEnabled = true
  }
}

export function isOpencodeAgentLoggingEnabled() {
  return agentActivityLoggingEnabled
}

export async function runWithOpencodeWorkerContext<T>(
  context: OpencodeWorkerContext & { taskLabel: string },
  run: () => Promise<T>
) {
  return opencodeWorkerContext.run(context, async () => {
    logOpencode(`assigned ${context.taskLabel}`)
    return run()
  })
}

type ActiveOpencodeContainer = {
  containerName: string
  stopLogFollower: () => void
  close: () => Promise<void>
}

const activeOpencodeContainers = new Map<string, ActiveOpencodeContainer>()
let shutdownHandlersInstalled = false
let shutdownInProgress = false
let shutdownPromise: Promise<void> | undefined
let shutdownSignalCount = 0

function shouldStreamContainerLogs() {
  return process.env.OPENCODE_STREAM_CONTAINER_LOGS !== '0'
}

function buildOpencodeServeArgs() {
  const logLevel = agentActivityLoggingEnabled
    ? 'DEBUG'
    : (process.env.OPENCODE_SERVER_LOG_LEVEL ??
      DEFAULT_OPENCODE_SERVER_LOG_LEVEL)
  const args = [
    'serve',
    '--hostname=0.0.0.0',
    `--port=${DEFAULT_OPENCODE_PORT}`,
    `--log-level=${logLevel}`,
  ]

  if (
    agentActivityLoggingEnabled ||
    process.env.OPENCODE_SERVER_PRINT_LOGS === '1'
  ) {
    args.push('--print-logs')
  }

  return args
}

export function formatContainerLogLine(line: string) {
  return `${formatOpencodeLogTag('auto')}[container] ${line}`
}

function emitContainerLogLine(line: string, stream: 'stdout' | 'stderr') {
  const trimmed = line.trimEnd()
  if (trimmed.length === 0) {
    return
  }

  const formatted = formatContainerLogLine(trimmed)
  if (stream === 'stderr') {
    console.error(formatted)
    return
  }

  console.log(formatted)
}

function followContainerLogs(containerName: string) {
  if (!shouldStreamContainerLogs()) {
    return () => {}
  }

  let stopped = false
  const child = spawn('docker', ['logs', '-f', '--timestamps', containerName], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let stdoutBuffer = ''
  let stderrBuffer = ''

  const flushBuffer = (
    buffer: string,
    stream: 'stdout' | 'stderr',
    final = false
  ) => {
    const parts = buffer.split('\n')
    const remainder = final ? '' : (parts.pop() ?? '')

    for (const line of parts) {
      emitContainerLogLine(line, stream)
    }

    return remainder
  }

  child.stdout?.on('data', (chunk) => {
    stdoutBuffer += chunk.toString()
    stdoutBuffer = flushBuffer(stdoutBuffer, 'stdout')
  })

  child.stderr?.on('data', (chunk) => {
    stderrBuffer += chunk.toString()
    stderrBuffer = flushBuffer(stderrBuffer, 'stderr')
  })

  child.on('close', () => {
    stdoutBuffer = flushBuffer(stdoutBuffer, 'stdout', true)
    stderrBuffer = flushBuffer(stderrBuffer, 'stderr', true)
  })

  child.on('error', (error) => {
    if (stopped) {
      return
    }

    stopped = true
    logOpencodeWarn(
      `failed to stream logs for container ${containerName}: ${error.message}`
    )
  })

  return () => {
    stopped = true
    child.kill('SIGTERM')
  }
}

function registerActiveOpencodeContainer(container: ActiveOpencodeContainer) {
  activeOpencodeContainers.set(container.containerName, container)
}

function unregisterActiveOpencodeContainer(containerName: string) {
  activeOpencodeContainers.delete(containerName)
}

function listEvalsOpencodeContainerRefs() {
  const result = spawnSync(
    'docker',
    [
      'ps',
      '-aq',
      '--filter',
      `label=${OPENCODE_DOCKER_RUN_LABEL}=${opencodeDockerRunId}`,
    ],
    { encoding: 'utf8' }
  )

  if (result.error) {
    console.error(
      `[opencode-docker][global] failed to list containers: ${result.error.message}`
    )
    return []
  }

  if (result.status !== 0) {
    const output = `${result.stderr}${result.stdout}`.trim()
    if (output.length > 0) {
      console.error(
        `[opencode-docker][global] failed to list containers: ${output}`
      )
    }
    return []
  }

  return result.stdout
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
}

export function forceStopEvalsOpencodeContainersSync(reason: string) {
  for (const container of activeOpencodeContainers.values()) {
    container.stopLogFollower()
  }

  const containerRefs = listEvalsOpencodeContainerRefs()
  if (containerRefs.length === 0) {
    return 0
  }

  console.error(
    `[opencode-docker][global] force stopping ${containerRefs.length} container(s) (${reason})`
  )

  const stopResult = spawnSync('docker', ['rm', '-f', ...containerRefs], {
    encoding: 'utf8',
  })

  if (stopResult.status !== 0) {
    const output =
      `${stopResult.stderr}${stopResult.stdout}`.trim() ||
      stopResult.error?.message ||
      'unknown docker rm error'
    console.error(`[opencode-docker][global] docker rm failed: ${output}`)
  }

  activeOpencodeContainers.clear()
  return containerRefs.length
}

async function stopOrphanEvalsOpencodeContainers(reason: string) {
  forceStopEvalsOpencodeContainersSync(reason)
}

export async function shutdownAllOpencodeDockerContainers(reason: string) {
  if (shutdownInProgress) {
    await shutdownPromise
    return
  }

  shutdownInProgress = true
  shutdownPromise = (async () => {
    const activeContainers = [...activeOpencodeContainers.values()]
    if (activeContainers.length > 0) {
      logOpencode(
        `shutting down ${activeContainers.length} active container(s) (${reason})`,
        'global'
      )
      await Promise.allSettled(
        activeContainers.map((container) => container.close())
      )
    }

    await stopOrphanEvalsOpencodeContainers(reason)
  })()

  await shutdownPromise
}

function installOpencodeDockerShutdownHandlers() {
  if (shutdownHandlersInstalled) {
    return
  }

  shutdownHandlersInstalled = true

  const handleSignal = (signal: 'SIGINT' | 'SIGTERM') => {
    shutdownSignalCount += 1

    if (shutdownSignalCount > 1) {
      logOpencodeError('force exit after repeated interrupt', 'global')
      forceStopEvalsOpencodeContainersSync('force exit')
      process.exit(signal === 'SIGINT' ? 130 : 143)
    }

    if (shutdownInProgress) {
      return
    }

    shutdownInProgress = true
    logOpencodeError(`received ${signal}; stopping containers`, 'global')
    forceStopEvalsOpencodeContainersSync(signal)
    process.exit(signal === 'SIGINT' ? 130 : 143)
  }

  // ai-sdk-provider-opencode-sdk registers its own SIGINT handler that calls
  // process.exit(0). prependListener ensures container cleanup runs first.
  process.prependListener('SIGINT', () => handleSignal('SIGINT'))
  process.prependListener('SIGTERM', () => handleSignal('SIGTERM'))
}

function ensureOpencodeDockerShutdownHandlers() {
  installOpencodeDockerShutdownHandlers()
}

installOpencodeDockerShutdownHandlers()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function execCommand(
  command: string,
  args: string[],
  options?: { timeoutMs?: number }
) {
  return new Promise<{ stdout: string; stderr: string; exitCode: number }>(
    (resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString()
      })
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString()
      })

      const timeout = options?.timeoutMs
        ? setTimeout(() => {
            child.kill('SIGKILL')
            reject(
              new Error(
                `${command} ${args.join(' ')} timed out after ${options.timeoutMs}ms`
              )
            )
          }, options.timeoutMs)
        : undefined

      child.on('error', (error) => {
        if (timeout) {
          clearTimeout(timeout)
        }
        reject(error)
      })

      child.on('close', (exitCode) => {
        if (timeout) {
          clearTimeout(timeout)
        }
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 1,
        })
      })
    }
  )
}

async function pathExists(targetPath: string) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

function getDockerBuildContext() {
  return path.resolve(process.cwd(), 'runner/docker/opencode')
}

export function getOpencodeTempRoot() {
  return configuredHostTmpdir ?? os.tmpdir()
}

async function ensureOpencodeTempRoot() {
  const tempRoot = getOpencodeTempRoot()
  await mkdir(tempRoot, { recursive: true })
  return tempRoot
}

export async function createOpencodeTempDir() {
  const tempRoot = await ensureOpencodeTempRoot()
  return mkdtemp(path.join(tempRoot, OPENCODE_TEMP_PREFIX))
}

export async function cleanupOpencodeTempDir(directory: string) {
  await rm(directory, { recursive: true, force: true })
}

async function isPortInUse(port: number, host = '127.0.0.1') {
  return new Promise<boolean>((resolve) => {
    const socket = createConnection(port, host, () => {
      socket.destroy()
      resolve(true)
    })
    return res.ok
  } catch {
    return false
  }
}

async function canBindPort(port: number, host = '127.0.0.1') {
  return new Promise<boolean>((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.listen(port, host, () => {
      server.close(() => resolve(true))
    })
  })
}

async function isOpencodeServerReady(port: number, host = '127.0.0.1') {
  const baseUrl = `http://${host}:${port}`

  for (const healthPath of ['/health', '/config']) {
    try {
      const response = await fetch(`${baseUrl}${healthPath}`, {
        signal: AbortSignal.timeout(2_000),
      })
      if (response.ok) {
        return true
      }
    } catch {
      continue
    }
  }

  return false
}

let portAllocationChain: Promise<void> = Promise.resolve()
let dockerContainerStartChain: Promise<void> = Promise.resolve()

const DOCKER_CONTAINER_START_MAX_ATTEMPTS = 3

async function withPortAllocationLock<T>(run: () => Promise<T>) {
  const previous = portAllocationChain
  let release = () => {}

  portAllocationChain = new Promise<void>((resolve) => {
    release = resolve
  })

  await previous

  try {
    return await run()
  } finally {
    release()
  }
}

async function withDockerContainerStartLock<T>(run: () => Promise<T>) {
  const previous = dockerContainerStartChain
  let release = () => {}

  dockerContainerStartChain = new Promise<void>((resolve) => {
    release = resolve
  })

  await previous

  try {
    return await run()
  } finally {
    release()
  }
}

function isDockerPortPublishError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('proxy already running') ||
    normalized.includes('address already in use') ||
    normalized.includes('bind: address already in use')
  )
}

async function isPortAvailable(port: number, host = '127.0.0.1') {
  if (await isPortInUse(port, host)) {
    return false
  }

  return canBindPort(port, host)
}

async function allocateFreePort(host = '127.0.0.1') {
  return new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, host, () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('failed to allocate a free host port for opencode'))
        return
      }

      const port = address.port
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(port)
      })
    })
  })
}

export async function allocateHostPort(preferredPort?: number) {
  return withPortAllocationLock(async () => {
    if (preferredPort === undefined) {
      const port = await allocateFreePort()
      logOpencode(`selected port ${port} (dynamic host port)`, 'global')
      return port
    }

    logOpencode(`checking preferred port ${preferredPort}`, 'global')

    if (await isPortAvailable(preferredPort)) {
      logOpencode(
        `selected port ${preferredPort} (preferred port available)`,
        'global'
      )
      return preferredPort
    }

    logOpencode(
      `preferred port ${preferredPort} unavailable; allocating fallback port`,
      'global'
    )
    const fallbackPort = await allocateFreePort()
    logOpencode(`selected port ${fallbackPort} (fallback)`, 'global')
    return fallbackPort
  })
}

async function waitForPort(port: number, timeoutMs: number) {
  logOpencode(
    `waiting for server on 127.0.0.1:${port} (timeout=${timeoutMs}ms)`
  )
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (await isOpencodeServerReady(port)) {
      logOpencode(`server ready on 127.0.0.1:${port}`)
      return
    }
    await sleep(250)
  }

  throw new Error(`opencode docker server did not become ready on port ${port}`)
}

async function dockerImageExists(image: string) {
  const result = await execCommand('docker', ['image', 'inspect', image])
  return result.exitCode === 0
}

const dockerImageEnsurePromises = new Map<string, Promise<string>>()

async function buildOpencodeDockerImage(image: string) {
  const buildContext = getDockerBuildContext()
  logOpencode(`building docker image ${image} from ${buildContext}`, 'global')
  const result = await execCommand(
    'docker',
    ['build', '-t', image, buildContext],
    { timeoutMs: 10 * 60 * 1000 }
  )

  if (result.exitCode !== 0) {
    throw new Error(
      `failed to build opencode docker image ${image}: ${result.stderr || result.stdout}`
    )
  }

  logOpencode(`built docker image ${image}`, 'global')
  return image
}

async function ensureOpencodeDockerImageOnce(image: string) {
  if (await dockerImageExists(image)) {
    logOpencode(`using existing docker image ${image}`, 'global')
    return image
  }

  return buildOpencodeDockerImage(image)
}

export async function ensureOpencodeDockerImage(image = DEFAULT_DOCKER_IMAGE) {
  let ensurePromise = dockerImageEnsurePromises.get(image)
  if (!ensurePromise) {
    ensurePromise = ensureOpencodeDockerImageOnce(image)
    dockerImageEnsurePromises.set(image, ensurePromise)
    void ensurePromise.finally(() => {
      dockerImageEnsurePromises.delete(image)
    })
  } else {
    logOpencode(
      `waiting for in-progress docker image ensure ${image}`,
      'global'
    )
  }

  return ensurePromise
}

export async function prepareOpencodeDockerRuntime(
  image = DEFAULT_DOCKER_IMAGE
) {
  ensureOpencodeDockerShutdownHandlers()
  logOpencode(`preparing docker runtime (image=${image})`, 'global')
  if (configuredHostTmpdir) {
    const tempRoot = await ensureOpencodeTempRoot()
    logOpencode(`host temp root: ${tempRoot}`, 'global')
  }
  await ensureOpencodeDockerImage(image)
  logOpencode(
    `docker runtime ready (serve log level=${agentActivityLoggingEnabled ? 'DEBUG' : (process.env.OPENCODE_SERVER_LOG_LEVEL ?? DEFAULT_OPENCODE_SERVER_LOG_LEVEL)}, stream container logs=${shouldStreamContainerLogs()}, agent logs=${agentActivityLoggingEnabled}, verbose=${isOpencodeVerboseLoggingEnabled()})`,
    'global'
  )
}

function buildDockerEnvArgs() {
  const args: string[] = []
  const passthroughEnvPattern = getPassthroughEnvPattern()

  for (const [key, value] of Object.entries(process.env)) {
    if (value && passthroughEnvPattern.test(key)) {
      args.push('-e', `${key}=${value}`)
    }
  }

  return args
}

async function readContainerLogs(containerName: string) {
  const result = await execCommand('docker', ['logs', containerName])
  const output = `${result.stdout}${result.stderr}`.trim()
  return output.length > 0 ? output : undefined
}

async function buildDockerVolumeArgs(hostWorkspace: string) {
  const resolvedWorkspace = path.resolve(hostWorkspace)
  const args = ['-v', `${resolvedWorkspace}:${OPENCODE_CONTAINER_WORKSPACE}:rw`]
  const cleanupPaths: string[] = []

  logOpencode(
    `bind mount: ${resolvedWorkspace} -> ${OPENCODE_CONTAINER_WORKSPACE} (rw)`
  )

  const homeDirectory = process.env.HOME ?? os.homedir()
  const authSource = path.join(homeDirectory, '.local/share/opencode/auth.json')

  if (await pathExists(authSource)) {
    const tempRoot = await ensureOpencodeTempRoot()
    const runtimeDataDirectory = await mkdtemp(
      path.join(tempRoot, OPENCODE_HOME_PREFIX)
    )
    cleanupPaths.push(runtimeDataDirectory)
    await mkdir(runtimeDataDirectory, { recursive: true })
    await copyFile(authSource, path.join(runtimeDataDirectory, 'auth.json'))
    args.push('-v', `${runtimeDataDirectory}:/root/.local/share/opencode:rw`)
    logOpencode(
      `bind mount: ${runtimeDataDirectory} -> /root/.local/share/opencode (rw, isolated auth.json)`
    )
  }

  for (const filename of ['opencode.json', 'opencode.jsonc'] as const) {
    const repoConfigSource = path.join(process.cwd(), filename)
    if (await pathExists(repoConfigSource)) {
      args.push(
        '-v',
        `${repoConfigSource}:/root/.config/opencode/${filename}:ro`
      )
      logOpencode(
        `bind mount: ${repoConfigSource} -> /root/.config/opencode/${filename} (ro, global config)`
      )
      break
    }
  }

  return { args, cleanupPaths }
}

export type OpencodeDockerServer = {
  port: number
  hostWorkspace: string
  containerWorkspace: string
  containerName: string
  cleanupPaths: string[]
  close(): Promise<void>
}

export async function startOpencodeDockerServer(options: {
  hostWorkspace: string
  timeout?: number
  port?: number
}): Promise<OpencodeDockerServer> {
  return withDockerContainerStartLock(async () => {
    ensureOpencodeDockerShutdownHandlers()
    const image = await ensureOpencodeDockerImage()
    const serverStartTimeout = Math.max(
      DOCKER_SERVER_START_TIMEOUT_MS,
      options.timeout ?? 0
    )
    const { args: volumeArgs, cleanupPaths } = await buildDockerVolumeArgs(
      options.hostWorkspace
    )
    const envArgs = buildDockerEnvArgs()

    let lastError: Error | undefined

    try {
      for (
        let attempt = 1;
        attempt <= DOCKER_CONTAINER_START_MAX_ATTEMPTS;
        attempt += 1
      ) {
        const hostPort = await allocateHostPort(options.port)
        const containerName = `${OPENCODE_CONTAINER_NAME_PREFIX}${randomUUID()}`

        logOpencode(
          `starting container ${containerName} (image=${image}, hostPort=${hostPort}, containerPort=${DEFAULT_OPENCODE_PORT}, cwd=${OPENCODE_CONTAINER_WORKSPACE}, attempt=${attempt}/${DOCKER_CONTAINER_START_MAX_ATTEMPTS})`
        )

        const runArgs = [
          'run',
          '--rm',
          '-d',
          '--name',
          containerName,
          '--init',
          '--security-opt',
          'no-new-privileges',
          '--label',
          `${OPENCODE_DOCKER_RUN_LABEL}=${opencodeDockerRunId}`,
          '-p',
          `127.0.0.1:${hostPort}:${DEFAULT_OPENCODE_PORT}`,
          ...volumeArgs,
          ...envArgs,
          '-w',
          OPENCODE_CONTAINER_WORKSPACE,
          image,
          ...buildOpencodeServeArgs(),
        ]

        const runResult = await execCommand('docker', runArgs, {
          timeoutMs: serverStartTimeout,
        })
        if (runResult.exitCode !== 0) {
          const failureOutput = runResult.stderr || runResult.stdout
          const willRetry =
            isDockerPortPublishError(failureOutput) &&
            attempt < DOCKER_CONTAINER_START_MAX_ATTEMPTS

          if (willRetry) {
            logOpencodeWarn(
              `failed to start container ${containerName}: ${failureOutput}`
            )
          } else {
            logOpencodeError(
              `failed to start container ${containerName}: ${failureOutput}`
            )
          }

          if (willRetry) {
            logOpencodeWarn(
              `container start hit podman/docker port proxy conflict; retrying after backoff`
            )
            await sleep(500 * attempt)
            lastError = new Error(
              `failed to start opencode docker container: ${failureOutput}`
            )
            continue
          }

          throw new Error(
            `failed to start opencode docker container: ${failureOutput}`
          )
        }

        const containerId = runResult.stdout.trim()
        if (containerId) {
          logOpencode(
            `container ${containerName} started (${containerId.slice(0, 12)})`
          )
        }

        const logFollower = {
          stop: () => {},
        }
        let containerClosed = false

        async function closeContainer() {
          if (containerClosed) {
            return
          }

          containerClosed = true
          logFollower.stop()
          unregisterActiveOpencodeContainer(containerName)

          logOpencode(`stopping container ${containerName}`)
          const stopResult = await execCommand('docker', [
            'rm',
            '-f',
            containerName,
          ])
          if (stopResult.exitCode !== 0) {
            logOpencodeWarn(
              `failed to stop container ${containerName}: ${stopResult.stderr || stopResult.stdout}`
            )
          } else {
            logOpencode(`stopped container ${containerName}`)
          }

          await Promise.all(
            cleanupPaths.map((cleanupPath) =>
              rm(cleanupPath, { recursive: true, force: true })
            )
          )
        }

        registerActiveOpencodeContainer({
          containerName,
          stopLogFollower: () => logFollower.stop(),
          close: closeContainer,
        })

        try {
          await waitForPort(hostPort, serverStartTimeout)
        } catch (error) {
          const containerLogs = await readContainerLogs(containerName)
          logOpencodeError(
            `container ${containerName} failed readiness check on port ${hostPort}`
          )
          if (containerLogs) {
            logOpencodeError(`container logs:\n${containerLogs}`)
          }
          await closeContainer()
          throw error
        }

        logFollower.stop = followContainerLogs(containerName)

        return {
          port: hostPort,
          hostWorkspace: options.hostWorkspace,
          containerWorkspace: OPENCODE_CONTAINER_WORKSPACE,
          containerName,
          cleanupPaths,
          close: closeContainer,
        }
      }

      throw (
        lastError ??
        new Error('failed to start opencode docker container after retries')
      )
    } catch (error) {
      await Promise.all(
        cleanupPaths.map((cleanupPath) =>
          rm(cleanupPath, { recursive: true, force: true })
        )
      )
      throw error
    }
  })
}

export async function runWithOpencodeDockerServer<T>(
  options: {
    hostWorkspace: string
    timeout?: number
    port?: number
    agentLogs?: boolean
    verbose?: boolean
  },
  run: (server: OpencodeDockerServer) => Promise<T>
) {
  logOpencode(
    `session start (workspace=${path.resolve(options.hostWorkspace)})`
  )
  const server = await startOpencodeDockerServer(options)
  const shouldLogAgentActivity =
    options.agentLogs ?? agentActivityLoggingEnabled
  const agentActivityLogger = shouldLogAgentActivity
    ? startOpencodeAgentActivityLogging({
        port: server.port,
        directory: server.containerWorkspace,
      })
    : undefined

  try {
    if (options.verbose) {
      logOpencodeTrace(
        `docker session ready container=${server.containerName} port=${server.port} directory=${server.containerWorkspace}; starting model call`
      )
    }
    const startedAt = Date.now()
    const result = await run(server)
    if (options.verbose) {
      logOpencodeTrace(
        `docker session model call finished in ${Date.now() - startedAt}ms container=${server.containerName}`
      )
    }
    return result
  } finally {
    agentActivityLogger?.stop()
    await server.close()
    logOpencode(
      `session end (container=${server.containerName}, port=${server.port})`
    )
  }
}
