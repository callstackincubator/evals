import { createOpencodeClient, type Event, type ToolPart } from '@opencode-ai/sdk'

import { logOpencodeAgent, logOpencodeWarn } from './opencode'

const PREVIEW_LIMIT = 240

function truncate(value: string, limit = PREVIEW_LIMIT) {
  if (value.length <= limit) {
    return value
  }

  return `${value.slice(0, limit)}…`
}

function stringifyValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function formatToolState(toolName: string, state: ToolPart['state']) {
  if (state.status === 'pending') {
    return `tool ${toolName} pending input=${truncate(stringifyValue(state.input))}`
  }

  if (state.status === 'running') {
    const title = state.title ? ` title=${state.title}` : ''
    return `tool ${toolName} running${title}`
  }

  if (state.status === 'completed') {
    return `tool ${toolName} completed title=${state.title} output=${truncate(state.output)}`
  }

  return `tool ${toolName} error=${state.error}`
}

export function formatAgentEvent(event: Event) {
  switch (event.type) {
    case 'session.created':
      return `session created id=${event.properties.info.id} title=${truncate(event.properties.info.title, 120)}`
    case 'session.status': {
      const status = event.properties.status
      if (status.type === 'busy') {
        return `session ${event.properties.sessionID} busy`
      }
      if (status.type === 'idle') {
        return `session ${event.properties.sessionID} idle`
      }
      return `session ${event.properties.sessionID} retry attempt=${status.attempt} message=${truncate(status.message, 120)}`
    }
    case 'session.idle':
      return `session ${event.properties.sessionID} idle`
    case 'session.error': {
      const error = event.properties.error
      const sessionId = event.properties.sessionID ?? 'unknown'
      if (!error || typeof error !== 'object') {
        return `session ${sessionId} error`
      }

      const message =
        'message' in error && typeof error.message === 'string'
          ? error.message
          : stringifyValue(error)
      return `session ${sessionId} error=${truncate(message, 160)}`
    }
    case 'message.part.updated': {
      const part = event.properties.part

      if (part.type === 'tool') {
        return formatToolState(part.tool, part.state)
      }

      if (part.type === 'agent') {
        return `agent ${part.name} invoked`
      }

      if (part.type === 'subtask') {
        return `subtask agent=${part.agent} description=${truncate(part.description, 120)}`
      }

      if (part.type === 'step-start') {
        return 'step started'
      }

      if (part.type === 'step-finish') {
        return `step finished reason=${part.reason} tokens=${part.tokens.input}/${part.tokens.output}`
      }

      if (part.type === 'patch') {
        return `patch files=${part.files.join(', ')}`
      }

      if (part.type === 'reasoning' && event.properties.delta) {
        return `reasoning delta=${truncate(event.properties.delta, 120)}`
      }

      if (part.type === 'text' && event.properties.delta) {
        return `text delta=${truncate(event.properties.delta, 120)}`
      }

      return undefined
    }
    case 'file.edited':
      return `file edited ${event.properties.file}`
    case 'command.executed':
      return `command ${event.properties.name} args=${truncate(event.properties.arguments, 160)}`
    case 'todo.updated': {
      const summary = event.properties.todos
        .map((todo) => `[${todo.status}] ${todo.content}`)
        .join('; ')
      return `todos updated ${truncate(summary, 200)}`
    }
    case 'permission.updated':
      return `permission requested title=${truncate(event.properties.title, 160)}`
    case 'permission.replied':
      return `permission replied response=${event.properties.response}`
    default:
      return undefined
  }
}

export function startOpencodeAgentActivityLogging(options: {
  port: number
  directory?: string
}) {
  const client = createOpencodeClient({
    baseUrl: `http://127.0.0.1:${options.port}`,
  })
  const abortController = new AbortController()

  logOpencodeAgent(
    `subscribing to agent events on port ${options.port}${options.directory ? ` directory=${options.directory}` : ''}`
  )

  void client
    .event.subscribe({
      query: options.directory ? { directory: options.directory } : undefined,
      signal: abortController.signal,
      onSseEvent: (sseEvent) => {
        const data = sseEvent.data
        if (!data || typeof data !== 'object' || !('type' in data)) {
          return
        }

        const formatted = formatAgentEvent(data as Event)
        if (formatted) {
          logOpencodeAgent(formatted)
        }
      },
      onSseError: (error) => {
        if (abortController.signal.aborted) {
          return
        }

        logOpencodeWarn(
          `agent event stream error: ${error instanceof Error ? error.message : String(error)}`
        )
      },
      sseMaxRetryAttempts: 5,
    })
    .then(({ stream }) =>
      (async () => {
        try {
          for await (const _ of stream) {
            // Events are handled in onSseEvent.
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            logOpencodeWarn(
              `agent event stream closed: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }
      })()
    )
    .catch((error) => {
      if (!abortController.signal.aborted) {
        logOpencodeWarn(
          `failed to subscribe to agent events: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    })

  return {
    stop() {
      abortController.abort()
    },
  }
}
