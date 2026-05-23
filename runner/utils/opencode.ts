import { spawn } from 'node:child_process'
import { AsyncLocalStorage } from 'node:async_hooks'
import { access, copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { createConnection, createServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

type OpencodeWorkerContext = {
  workerId: number
  workerCount: number
  taskLabel?: string
}

const opencodeWorkerContext = new AsyncLocalStorage<OpencodeWorkerContext>()

const OPENCODE_TEMP_PREFIX = 'evals-opencode-'
const OPENCODE_HOME_PREFIX = 'evals-opencode-home-'
const DEFAULT_DOCKER_IMAGE = 'evals-opencode:latest'
export const DEFAULT_OPENCODE_PORT = 4096
const DOCKER_SERVER_START_TIMEOUT_MS = 120_000

export const OPENCODE_CONTAINER_WORKSPACE = '/workspace'

const PASSTHROUGH_ENV_PATTERN =
  /^(OPENCODE_|OPENAI_|ANTHROPIC_|GOOGLE_|GEMINI_|AZURE_|AWS_|GITHUB_|GH_|PARASAIL_)/

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

function logOpencodeWarn(message: string, scope: 'auto' | 'global' = 'auto') {
  console.warn(`${formatOpencodeLogTag(scope)} ${message}`)
}

export function logOpencodeWorkerLegend(options: {
  workerCount: number
  role: 'solver' | 'judge'
}) {
  const workerLabel =
    options.workerCount === 1 ? '1 worker' : `${options.workerCount} workers`
  logOpencode(
    `worker legend: ${workerLabel} numbered 1..${options.workerCount}; each worker runs one ${options.role} opencode docker session at a time with an isolated /workspace bind mount`,
    'global'
  )
  logOpencode(
    'shared legend: docker image ensure, host port allocation, and container start are serialized globally across all workers',
    'global'
  )
}

export async function runWithOpencodeWorkerContext<T>(
  context: OpencodeWorkerContext & { taskLabel: string },
  run: () => Promise<T>
) {
  logOpencode(`assigned ${context.taskLabel}`)
  return opencodeWorkerContext.run(context, run)
}

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

function getDockerImage() {
  return process.env.OPENCODE_DOCKER_IMAGE ?? DEFAULT_DOCKER_IMAGE
}

function getDockerBuildContext() {
  return path.resolve(process.cwd(), 'runner/docker/opencode')
}

export async function createOpencodeTempDir() {
  return mkdtemp(path.join(os.tmpdir(), OPENCODE_TEMP_PREFIX))
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
    socket.on('error', () => resolve(false))
  })
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
      logOpencode(`selected port ${preferredPort} (preferred port available)`, 'global')
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

export async function ensureOpencodeDockerImage(image = getDockerImage()) {
  let ensurePromise = dockerImageEnsurePromises.get(image)
  if (!ensurePromise) {
    ensurePromise = ensureOpencodeDockerImageOnce(image)
    dockerImageEnsurePromises.set(image, ensurePromise)
    void ensurePromise.finally(() => {
      dockerImageEnsurePromises.delete(image)
    })
  } else {
    logOpencode(`waiting for in-progress docker image ensure ${image}`, 'global')
  }

  return ensurePromise
}

export async function prepareOpencodeDockerRuntime(image = getDockerImage()) {
  logOpencode(`preparing docker runtime (image=${image})`, 'global')
  await ensureOpencodeDockerImage(image)
  logOpencode('docker runtime ready', 'global')
}

function buildDockerEnvArgs() {
  const args: string[] = []

  for (const [key, value] of Object.entries(process.env)) {
    if (value && PASSTHROUGH_ENV_PATTERN.test(key)) {
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
  const authSource = path.join(
    homeDirectory,
    '.local/share/opencode/auth.json'
  )

  if (await pathExists(authSource)) {
    const runtimeDataDirectory = await mkdtemp(
      path.join(os.tmpdir(), OPENCODE_HOME_PREFIX)
    )
    cleanupPaths.push(runtimeDataDirectory)
    await mkdir(runtimeDataDirectory, { recursive: true })
    await copyFile(authSource, path.join(runtimeDataDirectory, 'auth.json'))
    args.push(
      '-v',
      `${runtimeDataDirectory}:/root/.local/share/opencode:rw`
    )
    logOpencode(
      `bind mount: ${runtimeDataDirectory} -> /root/.local/share/opencode (rw, isolated auth.json)`
    )
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
        const containerName = `evals-opencode-${randomUUID()}`

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
          '-p',
          `127.0.0.1:${hostPort}:${DEFAULT_OPENCODE_PORT}`,
          ...volumeArgs,
          ...envArgs,
          '-w',
          OPENCODE_CONTAINER_WORKSPACE,
          image,
          'serve',
          '--hostname=0.0.0.0',
          `--port=${DEFAULT_OPENCODE_PORT}`,
        ]

        const runResult = await execCommand('docker', runArgs, {
          timeoutMs: serverStartTimeout,
        })
        if (runResult.exitCode !== 0) {
          const failureOutput = runResult.stderr || runResult.stdout
          logOpencodeError(
            `failed to start container ${containerName}: ${failureOutput}`
          )

          if (
            isDockerPortPublishError(failureOutput) &&
            attempt < DOCKER_CONTAINER_START_MAX_ATTEMPTS
          ) {
            logOpencode(
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
          await execCommand('docker', ['rm', '-f', containerName])
          throw error
        }

        return {
          port: hostPort,
          hostWorkspace: options.hostWorkspace,
          containerWorkspace: OPENCODE_CONTAINER_WORKSPACE,
          containerName,
          cleanupPaths,
          async close() {
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
          },
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
  },
  run: (server: OpencodeDockerServer) => Promise<T>
) {
  logOpencode(
    `session start (workspace=${path.resolve(options.hostWorkspace)})`
  )
  const server = await startOpencodeDockerServer(options)

  try {
    return await run(server)
  } finally {
    await server.close()
    logOpencode(
      `session end (container=${server.containerName}, port=${server.port})`
    )
  }
}
