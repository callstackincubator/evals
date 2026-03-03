import {
  createOpencodeClient,
  type FileDiff,
  type Message,
  type Part,
} from '@opencode-ai/sdk'

const DEFAULT_OPENCODE_PORT = 4096

export type OpencodeSessionMessageSnapshot = {
  id: string
  role: Message['role']
  createdAt: string
  completedAt?: string
  content: string
  modelId?: string
  providerId?: string
  cost?: number
  tokens?: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
  }
  partsCount: number
  partTypes: Record<string, number>
}

export type OpencodeSessionSnapshot = {
  sessionId: string
  session: {
    title: string
    directory: string
    createdAt: string
    updatedAt: string
  }
  conversation: {
    messageCount: number
    userTurns: number
    assistantTurns: number
    turnCount: number
  }
  tokenUsage: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
  }
  changes: {
    additions: number
    deletions: number
    files: number
    touchedFiles: string[]
  }
  messages: OpencodeSessionMessageSnapshot[]
}

function formatUnixMs(timestampMs: number) {
  return new Date(timestampMs).toISOString()
}

function aggregatePartTypes(parts: Part[]) {
  const partTypes: Record<string, number> = {}

  for (const part of parts) {
    partTypes[part.type] = (partTypes[part.type] ?? 0) + 1
  }

  return partTypes
}

function extractMessageContent(parts: Part[]) {
  const segments: string[] = []

  for (const part of parts) {
    if (part.type === 'text' || part.type === 'reasoning') {
      if (part.text.trim().length > 0) {
        segments.push(part.text)
      }
      continue
    }

    if (part.type === 'tool') {
      if (part.state.status === 'completed' && part.state.output.trim().length > 0) {
        segments.push(part.state.output)
      }
      continue
    }

    if (part.type === 'subtask') {
      const prompt = part.prompt.trim()
      if (prompt.length > 0) {
        segments.push(prompt)
      }
    }
  }

  return segments.join('\n\n').trim()
}

function summarizeMessage(message: {
  info: Message
  parts: Part[]
}): OpencodeSessionMessageSnapshot {
  const content = extractMessageContent(message.parts)

  if (message.info.role === 'assistant') {
    return {
      id: message.info.id,
      role: message.info.role,
      createdAt: formatUnixMs(message.info.time.created),
      completedAt: message.info.time.completed
        ? formatUnixMs(message.info.time.completed)
        : undefined,
      content,
      modelId: message.info.modelID,
      providerId: message.info.providerID,
      cost: message.info.cost,
      tokens: {
        input: message.info.tokens.input,
        output: message.info.tokens.output,
        reasoning: message.info.tokens.reasoning,
        cacheRead: message.info.tokens.cache.read,
        cacheWrite: message.info.tokens.cache.write,
      },
      partsCount: message.parts.length,
      partTypes: aggregatePartTypes(message.parts),
    }
  }

  return {
    id: message.info.id,
    role: message.info.role,
    createdAt: formatUnixMs(message.info.time.created),
    content,
    modelId: message.info.model.modelID,
    providerId: message.info.model.providerID,
    partsCount: message.parts.length,
    partTypes: aggregatePartTypes(message.parts),
  }
}

function aggregateTokens(messages: OpencodeSessionMessageSnapshot[]) {
  return messages.reduce(
    (accumulator, message) => {
      if (!message.tokens) {
        return accumulator
      }

      accumulator.input += message.tokens.input
      accumulator.output += message.tokens.output
      accumulator.reasoning += message.tokens.reasoning
      accumulator.cacheRead += message.tokens.cacheRead
      accumulator.cacheWrite += message.tokens.cacheWrite

      return accumulator
    },
    {
      input: 0,
      output: 0,
      reasoning: 0,
      cacheRead: 0,
      cacheWrite: 0,
    }
  )
}

function uniqueTouchedFiles(
  sessionDiffs: FileDiff[],
  messageDiffs: FileDiff[]
) {
  const touchedFiles = new Set<string>()

  for (const diff of [...sessionDiffs, ...messageDiffs]) {
    touchedFiles.add(diff.file)
  }

  return Array.from(touchedFiles).sort()
}

function summarizeChanges(
  sessionSummary: {
    additions: number
    deletions: number
    files: number
    diffs?: FileDiff[]
  } | undefined,
  sessionDiffs: FileDiff[]
) {
  const sessionDiffAdditions = sessionDiffs.reduce(
    (sum, diff) => sum + diff.additions,
    0
  )
  const sessionDiffDeletions = sessionDiffs.reduce(
    (sum, diff) => sum + diff.deletions,
    0
  )

  const messageDiffs = sessionSummary?.diffs ?? []

  return {
    additions: sessionSummary?.additions ?? sessionDiffAdditions,
    deletions: sessionSummary?.deletions ?? sessionDiffDeletions,
    files: sessionSummary?.files ?? sessionDiffs.length,
    touchedFiles: uniqueTouchedFiles(sessionDiffs, messageDiffs),
  }
}

export async function collectOpencodeSessionSnapshot(params: {
  sessionId?: string
  port?: number
  directory?: string
}): Promise<OpencodeSessionSnapshot | undefined> {
  if (!params.sessionId) {
    return undefined
  }

  const client = createOpencodeClient({
    baseUrl: `http://127.0.0.1:${params.port ?? DEFAULT_OPENCODE_PORT}`,
  })

  let session: unknown
  let messages: unknown
  let sessionDiffs: unknown

  try {
    const [sessionResponse, messagesResponse, sessionDiffsResponse] =
      await Promise.all([
      client.session.get({
        path: { id: params.sessionId },
        query: { directory: params.directory },
        throwOnError: true,
      }),
      client.session.messages({
        path: { id: params.sessionId },
        query: { directory: params.directory, limit: 500 },
        throwOnError: true,
      }),
      client.session.diff({
        path: { id: params.sessionId },
        query: { directory: params.directory },
        throwOnError: true,
      }),
      ])

    session = sessionResponse.data
    messages = messagesResponse.data
    sessionDiffs = sessionDiffsResponse.data
  } catch {
    return undefined
  }

  if (
    !session ||
    !messages ||
    !sessionDiffs ||
    typeof session !== 'object' ||
    !Array.isArray(messages) ||
    !Array.isArray(sessionDiffs)
  ) {
    return undefined
  }

  const typedSession = session as {
    title: string
    directory: string
    time: {
      created: number
      updated: number
    }
    summary?: {
      additions: number
      deletions: number
      files: number
      diffs?: FileDiff[]
    }
  }

  const typedMessages = messages as Array<{
    info: Message
    parts: Part[]
  }>
  const typedSessionDiffs = sessionDiffs as FileDiff[]

  const messageSnapshots = typedMessages
    .map((message) => summarizeMessage(message))
    .sort((first, second) =>
      first.createdAt.localeCompare(second.createdAt)
    )

  const userTurns = messageSnapshots.filter(
    (message) => message.role === 'user'
  ).length
  const assistantTurns = messageSnapshots.filter(
    (message) => message.role === 'assistant'
  ).length

  return {
    sessionId: params.sessionId,
    session: {
      title: typedSession.title,
      directory: typedSession.directory,
      createdAt: formatUnixMs(typedSession.time.created),
      updatedAt: formatUnixMs(typedSession.time.updated),
    },
    conversation: {
      messageCount: messageSnapshots.length,
      userTurns,
      assistantTurns,
      turnCount: Math.max(userTurns, assistantTurns),
    },
    tokenUsage: aggregateTokens(messageSnapshots),
    changes: summarizeChanges(typedSession.summary, typedSessionDiffs),
    messages: messageSnapshots,
  }
}
