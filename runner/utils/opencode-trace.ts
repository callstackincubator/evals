import { createOpencodeClient, type Part } from '@opencode-ai/sdk'

const HEARTBEAT_INTERVAL_MS = 3_000

let verboseLoggingEnabled = false

export function configureOpencodeVerboseLogging(options: { verbose?: boolean }) {
  if (options.verbose !== undefined) {
    verboseLoggingEnabled = options.verbose
  }
}

export function isOpencodeVerboseLoggingEnabled() {
  return verboseLoggingEnabled
}

export function logOpencodeTrace(message: string) {
  console.log(`[opencode-trace] ${message}`)
}

function formatElapsed(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`
  }

  return `${(ms / 1000).toFixed(1)}s`
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    const name = error.name !== 'Error' ? `${error.name}: ` : ''
    return `${name}${error.message}`
  }

  return String(error)
}

function isTimeoutLikeError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    /timed out|timeout|aborted|abort/i.test(error.message)
  )
}

function summarizeLatestActivity(parts: Part[]) {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index]

    if (part.type === 'tool') {
      if (part.state.status === 'running') {
        return `tool ${part.tool} running title=${part.state.title ?? 'n/a'}`
      }

      if (part.state.status === 'pending') {
        return `tool ${part.tool} pending`
      }

      if (part.state.status === 'completed') {
        return `tool ${part.tool} completed title=${part.state.title}`
      }

      if (part.state.status === 'error') {
        return `tool ${part.tool} error=${part.state.error}`
      }
    }

    if (part.type === 'reasoning' && part.text.trim().length > 0) {
      return `reasoning chars=${part.text.length}`
    }

    if (part.type === 'text' && part.text.trim().length > 0) {
      return `text chars=${part.text.length}`
    }

    if (part.type === 'step-finish') {
      return `step-finish reason=${part.reason} tokens=${part.tokens.input}/${part.tokens.output}`
    }
  }

  return 'no assistant activity yet'
}

async function fetchSessionProgress(options: {
  port: number
  directory?: string
  sessionId?: string
}) {
  const client = createOpencodeClient({
    baseUrl: `http://127.0.0.1:${options.port}`,
  })

  let sessionId = options.sessionId

  if (!sessionId) {
    const sessionsResponse = await client.session.list({
      query: options.directory ? { directory: options.directory } : undefined,
    })

    const sessions = sessionsResponse.data
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return 'session=none'
    }

    const latestSession = [...sessions].sort(
      (first, second) => second.time.updated - first.time.updated
    )[0]
    sessionId = latestSession.id
  }

  const [statusResponse, messagesResponse] = await Promise.all([
    client.session.status({
      query: options.directory ? { directory: options.directory } : undefined,
    }),
    client.session.messages({
      path: { id: sessionId },
      query: {
        directory: options.directory,
        limit: 20,
      },
    }),
  ])

  const statusRecord = statusResponse.data
  const sessionStatus =
    statusRecord && typeof statusRecord === 'object'
      ? statusRecord[sessionId]
      : undefined

  let statusLabel = 'unknown'
  if (sessionStatus?.type === 'busy') {
    statusLabel = 'busy'
  } else if (sessionStatus?.type === 'idle') {
    statusLabel = 'idle'
  } else if (sessionStatus?.type === 'retry') {
    statusLabel = `retry attempt=${sessionStatus.attempt} next=${sessionStatus.next}`
  }

  const messages = messagesResponse.data
  const latestAssistant = Array.isArray(messages)
    ? [...messages]
        .reverse()
        .find((message) => message.info.role === 'assistant')
    : undefined

  const activity = latestAssistant
    ? summarizeLatestActivity(latestAssistant.parts)
    : 'waiting for assistant message'

  const messageCount = Array.isArray(messages) ? messages.length : 0

  return `session=${sessionId} status=${statusLabel} messages=${messageCount} activity=${activity}`
}

export type OpencodeCallTracer = {
  setPhase(phase: string): void
  noteSessionId(sessionId: string): void
  stop(): void
}

export function startOpencodeCallTracer(options: {
  label: string
  model: string
  port: number
  directory?: string
  timeoutMs: number
  inputSummary?: string
}): OpencodeCallTracer {
  if (!verboseLoggingEnabled) {
    return {
      setPhase() {},
      noteSessionId() {},
      stop() {},
    }
  }

  const startedAt = Date.now()
  let phase = 'initializing'
  let sessionId: string | undefined
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined

  logOpencodeTrace(
    `${options.label} start model=${options.model} port=${options.port} timeout=${options.timeoutMs}ms directory=${options.directory ?? 'default'}${options.inputSummary ? ` ${options.inputSummary}` : ''}`
  )

  heartbeatTimer = setInterval(() => {
    void (async () => {
      const elapsedMs = Date.now() - startedAt
      const remainingMs = Math.max(options.timeoutMs - elapsedMs, 0)

      let progress = 'session progress unavailable'
      try {
        progress = await fetchSessionProgress({
          port: options.port,
          directory: options.directory,
          sessionId,
        })
      } catch (error) {
        progress = `session poll failed: ${formatError(error)}`
      }

      logOpencodeTrace(
        `${options.label} heartbeat phase=${phase} elapsed=${formatElapsed(elapsedMs)} remaining=${formatElapsed(remainingMs)} ${progress}`
      )
    })()
  }, HEARTBEAT_INTERVAL_MS)

  return {
    setPhase(nextPhase) {
      phase = nextPhase
      logOpencodeTrace(
        `${options.label} phase=${phase} elapsed=${formatElapsed(Date.now() - startedAt)}`
      )
    },
    noteSessionId(nextSessionId) {
      sessionId = nextSessionId
      logOpencodeTrace(
        `${options.label} session-id=${nextSessionId} phase=${phase} elapsed=${formatElapsed(Date.now() - startedAt)}`
      )
    },
    stop() {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = undefined
      }

      logOpencodeTrace(
        `${options.label} stop phase=${phase} total=${formatElapsed(Date.now() - startedAt)}`
      )
    },
  }
}

export async function runTracedOpencodeCall<T>(
  tracer: OpencodeCallTracer,
  phase: string,
  run: () => Promise<T>
): Promise<T> {
  if (!verboseLoggingEnabled) {
    return run()
  }

  tracer.setPhase(phase)
  const startedAt = Date.now()

  try {
    const result = await run()
    logOpencodeTrace(
      `phase=${phase} completed in ${formatElapsed(Date.now() - startedAt)}`
    )
    return result
  } catch (error) {
    const timeoutHint = isTimeoutLikeError(error) ? ' (timeout/abort)' : ''
    logOpencodeTrace(
      `phase=${phase} failed after ${formatElapsed(Date.now() - startedAt)}${timeoutHint}: ${formatError(error)}`
    )
    throw error
  }
}
