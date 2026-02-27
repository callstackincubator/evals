import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

import {
  OPENCODE_NO_TOOLS,
  ensureOpencodeServerStarted,
  isRecoverableOpencodeError,
  restartOpencodeServer,
} from 'runner/utils/opencode'
import type { LoadedFile } from 'runner/utils/fs'
import {
  SOLVER_SYSTEM_PROMPT,
  SOLVER_JSON_FALLBACK_SYSTEM_PROMPT,
  SOLVER_OPENCODE_SYSTEM_PROMPT,
  SOLVER_TEMPERATURE,
  SOLVER_STREAM,
  SOLVER_DEFAULT_MAX_TOKENS,
  SOLVER_MAX_TOKENS_CAP,
  SOLVER_STRUCTURED_OUTPUT_ATTEMPTS,
  SOLVER_JSON_FALLBACK_ATTEMPTS,
  SOLVER_LLAMACPP_JSON_FALLBACK_ATTEMPTS,
  SOLVER_LLAMACPP_MAX_ATTEMPTS,
  SOLVER_LLAMACPP_DEFAULT_BASE_URL,
  SOLVER_LLAMACPP_DISABLE_THINKING,
} from 'runner/deterministic_model_config/solver'

const SYSTEM_PROMPT = SOLVER_SYSTEM_PROMPT
const JSON_FALLBACK_SYSTEM_PROMPT = SOLVER_JSON_FALLBACK_SYSTEM_PROMPT
const STRUCTURED_OUTPUT_ATTEMPTS = SOLVER_STRUCTURED_OUTPUT_ATTEMPTS
const JSON_FALLBACK_ATTEMPTS = SOLVER_JSON_FALLBACK_ATTEMPTS
const LLAMACPP_DEFAULT_BASE_URL = SOLVER_LLAMACPP_DEFAULT_BASE_URL
const LLAMACPP_DEFAULT_MAX_TOKENS = SOLVER_DEFAULT_MAX_TOKENS
const LLAMACPP_MAX_TOKENS_CAP = SOLVER_MAX_TOKENS_CAP
const LLAMACPP_JSON_FALLBACK_ATTEMPTS = SOLVER_LLAMACPP_JSON_FALLBACK_ATTEMPTS
const LLAMACPP_MAX_ATTEMPTS = SOLVER_LLAMACPP_MAX_ATTEMPTS

const solverOutputSchema = z.object({
  summary: z.string().describe('Short summary of performed work'),
  files: z
    .array(
      z.object({
        path: z.string().min(1),
        content: z.string(),
      })
    )
    .min(1),
})

export type SolverResult = {
  files: LoadedFile[]
  summary?: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function isNoOutputGeneratedError(error: unknown) {
  return /no output generated/i.test(getErrorMessage(error))
}

function isLlamacppModel(model: string) {
  return model.trim().toLowerCase().startsWith('llamacpp/')
}

function getLlamacppModelId(model: string) {
  return model.replace(/^llamacpp\//i, '').trim()
}

function getLlamacppBaseUrl() {
  const raw = process.env.LLAMACPP_BASE_URL?.trim() || LLAMACPP_DEFAULT_BASE_URL
  const normalized = raw.replace(/\/+$/, '')

  if (/\/v\d+$/i.test(normalized)) {
    return normalized
  }

  return `${normalized}/v1`
}

function getLlamacppMaxTokens() {
  const raw = process.env.LLAMACPP_MAX_TOKENS?.trim()
  if (!raw) {
    return LLAMACPP_DEFAULT_MAX_TOKENS
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return LLAMACPP_DEFAULT_MAX_TOKENS
  }

  return parsed
}

function getLlamacppMaxTokensCap() {
  const raw = process.env.LLAMACPP_MAX_TOKENS_CAP?.trim()
  if (!raw) {
    return LLAMACPP_MAX_TOKENS_CAP
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return LLAMACPP_MAX_TOKENS_CAP
  }

  return parsed
}

function shouldDisableLlamacppThinking() {
  const raw = process.env.LLAMACPP_DISABLE_THINKING?.trim().toLowerCase()
  if (!raw) {
    return SOLVER_LLAMACPP_DISABLE_THINKING
  }

  return !['0', 'false', 'no', 'off'].includes(raw)
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

function sanitizeGeneratedPath(relativePath: string) {
  const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\/+/, '')
  const segments = normalizedPath
    .split('/')
    .filter(Boolean)
    .filter((segment) => segment !== '.' && segment !== '..')

  return segments.join('/')
}

export async function materializeFiles(
  outputDirectory: string,
  files: Array<{ path: string; content: string }>
): Promise<LoadedFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const safeRelativePath = sanitizeGeneratedPath(file.path)
      const absolutePath = path.join(outputDirectory, safeRelativePath)

      await mkdir(path.dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, file.content, 'utf8')

      return {
        path: toPosixPath(safeRelativePath),
        absolutePath,
        content: file.content,
      }
    })
  )
}

function buildSolverPrompt(prompt: string, inputFiles: LoadedFile[]) {
  const files = inputFiles
    .map((file) => {
      return `<file path="${file.path}">
${file.content}
</file>`
    })
    .join('\n\n')

  return `${prompt}

<files>
${files}
</files>`
}

function buildCompactSolverPrompt(prompt: string, inputFiles: LoadedFile[]) {
  const files = inputFiles
    .map((file) => `<file path="${file.path}">\n${file.content}\n</file>`)
    .join('\n')

  return `${prompt}
Return JSON only.
Modify the provided files and return full contents for the files you changed.
Prefer editing existing files only. Do not create new files unless necessary.
${files}`
}

function parseSolverOutputFromText(rawText: string) {
  const normalized = rawText.trim()
  const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const fencedCandidate = fencedMatch?.[1]?.trim()

  const candidates = [fencedCandidate, normalized]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => {
      const firstBrace = value.indexOf('{')
      const lastBrace = value.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        return [value]
      }

      return [value, value.slice(firstBrace, lastBrace + 1)]
    })

  for (const candidate of candidates) {
    try {
      const parsedJson = JSON.parse(candidate)
      const parsed = solverOutputSchema.safeParse(parsedJson)
      if (parsed.success) {
        return parsed
      }
    } catch {
      continue
    }
  }

  return solverOutputSchema.safeParse(null)
}

function stripMarkdownCodeFence(rawText: string) {
  const trimmed = rawText.trim()
  const fencedMatch = trimmed.match(/^```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```$/)
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  return trimmed
}

function getOpenAiMessageContent(message: unknown) {
  if (!message || typeof message !== 'object') {
    return ''
  }

  const content = (message as { content?: unknown }).content
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== 'object') {
          return ''
        }
        const typedPart = part as { type?: unknown; text?: unknown }
        if (typedPart.type !== 'text' || typeof typedPart.text !== 'string') {
          return ''
        }
        return typedPart.text
      })
      .join('')
  }

  return ''
}

async function resolveLlamacppModelId(
  baseUrl: string,
  requestedModelId: string,
  timeout: number
) {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      signal: AbortSignal.timeout(timeout),
    })

    if (!response.ok) {
      return requestedModelId
    }

    const payload = (await response.json()) as {
      data?: Array<{ id?: string }>
      models?: Array<{ id?: string; model?: string; name?: string }>
    }

    const candidateIds = new Set<string>()
    for (const item of payload.data ?? []) {
      if (typeof item?.id === 'string' && item.id.trim()) {
        candidateIds.add(item.id.trim())
      }
    }
    for (const item of payload.models ?? []) {
      const values = [item?.id, item?.model, item?.name]
      for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
          candidateIds.add(value.trim())
        }
      }
    }

    if (candidateIds.has(requestedModelId)) {
      return requestedModelId
    }

    const suffixMatch = [...candidateIds].find((candidate) =>
      candidate.toLowerCase().endsWith(`/${requestedModelId.toLowerCase()}`)
    )
    if (suffixMatch) {
      return suffixMatch
    }
  } catch {
    // Best effort model resolution; direct chat call below will surface errors.
  }

  return requestedModelId
}

async function runDirectLlamacppSolver(params: {
  prompt: string
  files: LoadedFile[]
  model: string
  timeout: number
}) {
  const prompt = buildCompactSolverPrompt(params.prompt, params.files)
  const baseUrl = getLlamacppBaseUrl()
  const maxTokens = getLlamacppMaxTokens()
  const maxTokensCap = Math.max(maxTokens, getLlamacppMaxTokensCap())
  const disableThinking = shouldDisableLlamacppThinking()
  const requestedModelId = getLlamacppModelId(params.model)
  const resolvedModelId = await resolveLlamacppModelId(
    baseUrl,
    requestedModelId,
    params.timeout
  )

  const fallbackFailures: string[] = []
  for (let attempt = 1; attempt <= LLAMACPP_MAX_ATTEMPTS; attempt++) {
    const attemptMaxTokens = Math.min(maxTokens * 2 ** (attempt - 1), maxTokensCap)
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.LLAMACPP_API_KEY
            ? { authorization: `Bearer ${process.env.LLAMACPP_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          model: resolvedModelId,
          messages: [
            {
              role: 'system',
              content: JSON_FALLBACK_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: SOLVER_STREAM,
          temperature: SOLVER_TEMPERATURE,
          max_tokens: attemptMaxTokens,
          ...(disableThinking
            ? {
                chat_template_kwargs: {
                  enable_thinking: false,
                },
              }
            : {}),
        }),
        signal: AbortSignal.timeout(params.timeout),
      })

      const responseText = await response.text()
      if (!response.ok) {
        fallbackFailures.push(
          `fallback attempt ${attempt}: HTTP ${response.status} ${response.statusText}${
            responseText.trim() ? ` (${responseText.trim().slice(0, 240)})` : ''
          }`
        )
        continue
      }

      let payload: unknown
      try {
        payload = JSON.parse(responseText)
      } catch {
        fallbackFailures.push(
          `fallback attempt ${attempt}: invalid JSON from llama-server`
        )
        continue
      }

      const firstChoice = (payload as {
        choices?: Array<{ message?: unknown; finish_reason?: unknown }>
      })?.choices?.[0]
      const message = firstChoice?.message
      const content = getOpenAiMessageContent(message)
      const parsedOutput = parseSolverOutputFromText(content)
      if (parsedOutput.success) {
        return parsedOutput.data
      }

      const finishReason =
        typeof firstChoice?.finish_reason === 'string'
          ? firstChoice.finish_reason
          : ''
      fallbackFailures.push(
        content.trim().length === 0
          ? `fallback attempt ${attempt}: no output generated${
              finishReason
                ? ` (finish_reason=${finishReason}, max_tokens=${attemptMaxTokens})`
                : ` (max_tokens=${attemptMaxTokens})`
            }`
          : `fallback attempt ${attempt}: invalid JSON output${
              finishReason
                ? ` (finish_reason=${finishReason}, max_tokens=${attemptMaxTokens})`
                : ` (max_tokens=${attemptMaxTokens})`
            }`
      )
    } catch (error) {
      fallbackFailures.push(
        `fallback attempt ${attempt}: ${getErrorMessage(error)} (max_tokens=${attemptMaxTokens})`
      )
    }

    if (
      attempt >= LLAMACPP_JSON_FALLBACK_ATTEMPTS &&
      attemptMaxTokens >= maxTokensCap
    ) {
      break
    }
  }

  // Fallback for single-file evals: ask for code-only output instead of JSON.
  if (params.files.length === 1 && params.files[0]) {
    const singleFile = params.files[0]
    const singleFileFailures: string[] = []

    for (let attempt = 1; attempt <= LLAMACPP_MAX_ATTEMPTS; attempt++) {
      const attemptMaxTokens = Math.min(
        maxTokens * 2 ** (attempt - 1),
        maxTokensCap
      )

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(process.env.LLAMACPP_API_KEY
              ? { authorization: `Bearer ${process.env.LLAMACPP_API_KEY}` }
              : {}),
          },
          body: JSON.stringify({
            model: resolvedModelId,
            messages: [
              {
                role: 'system',
                content: `Return only the full updated file content for "${singleFile.path}". No JSON, no markdown, no explanation.`,
              },
              {
                role: 'user',
                content: `${params.prompt}\nEdit this file and return only the full updated file content.\n<file path="${singleFile.path}">\n${singleFile.content}\n</file>`,
              },
            ],
            stream: SOLVER_STREAM,
            temperature: SOLVER_TEMPERATURE,
            max_tokens: attemptMaxTokens,
            ...(disableThinking
              ? {
                  chat_template_kwargs: {
                    enable_thinking: false,
                  },
                }
              : {}),
          }),
          signal: AbortSignal.timeout(params.timeout),
        })

        const responseText = await response.text()
        if (!response.ok) {
          singleFileFailures.push(
            `single-file attempt ${attempt}: HTTP ${response.status} ${response.statusText}${
              responseText.trim() ? ` (${responseText.trim().slice(0, 240)})` : ''
            }`
          )
          continue
        }

        let payload: unknown
        try {
          payload = JSON.parse(responseText)
        } catch {
          singleFileFailures.push(
            `single-file attempt ${attempt}: invalid JSON from llama-server`
          )
          continue
        }

        const firstChoice = (payload as {
          choices?: Array<{ message?: unknown; finish_reason?: unknown }>
        })?.choices?.[0]
        const finishReason =
          typeof firstChoice?.finish_reason === 'string'
            ? firstChoice.finish_reason
            : ''
        const rawContent = getOpenAiMessageContent(firstChoice?.message)
        const fileContent = stripMarkdownCodeFence(rawContent)
        if (fileContent.trim().length > 0) {
          return {
            summary: 'Used single-file local fallback output',
            files: [
              {
                path: singleFile.path,
                content: fileContent,
              },
            ],
          }
        }

        singleFileFailures.push(
          `single-file attempt ${attempt}: empty content${
            finishReason
              ? ` (finish_reason=${finishReason}, max_tokens=${attemptMaxTokens})`
              : ` (max_tokens=${attemptMaxTokens})`
          }`
        )
      } catch (error) {
        singleFileFailures.push(
          `single-file attempt ${attempt}: ${getErrorMessage(error)} (max_tokens=${attemptMaxTokens})`
        )
      }

      if (attemptMaxTokens >= maxTokensCap) {
        break
      }
    }

    fallbackFailures.push(
      `single-file fallback failed: ${singleFileFailures.join('; ')}`
    )
  }

  throw new Error(
    `solver did not return valid file output (structured output failed: structured output skipped for local llamacpp model; fallback failed: ${fallbackFailures.join(
      '; '
    )}; direct llamacpp endpoint: ${baseUrl}; model: ${resolvedModelId}; max_tokens_base: ${maxTokens}; max_tokens_cap: ${maxTokensCap}; thinking_disabled: ${disableThinking})`
  )
}

/*
  Runs an OpenCode-backed solver and materializes generated files for judges.
*/
export async function runSolver(params: {
  prompt: string
  files: LoadedFile[]
  workingDirectory: string
  model: string
  timeout: number
  port?: number
}) {
  const localLlamacpp = isLlamacppModel(params.model)
  if (localLlamacpp) {
    return await runDirectLlamacppSolver({
      prompt: params.prompt,
      files: params.files,
      model: params.model,
      timeout: params.timeout,
    })
  }

  const prompt = buildSolverPrompt(params.prompt, params.files)
  const runOnce = async () => {
    await ensureOpencodeServerStarted(params)

    const provider = createOpencode({
      port: params.port,
      autoStartServer: false,
    })

    const createSolverModel = () =>
      provider(params.model, {
        createNewSession: true,
        agent: 'general',
        systemPrompt: SOLVER_OPENCODE_SYSTEM_PROMPT,
        tools: OPENCODE_NO_TOOLS,
        cwd: params.workingDirectory,
      })

    let structuredOutputError: unknown = null
    for (let attempt = 1; attempt <= STRUCTURED_OUTPUT_ATTEMPTS; attempt++) {
      try {
        const { output } = await generateText({
          model: createSolverModel(),
          prompt,
          system: SYSTEM_PROMPT,
          abortSignal: AbortSignal.timeout(params.timeout),
          output: Output.object({
            schema: solverOutputSchema,
            description: 'Generated files that satisfy the task',
          }),
        })

        return output
      } catch (error) {
        structuredOutputError = error
        const shouldRetry =
          attempt < STRUCTURED_OUTPUT_ATTEMPTS && isNoOutputGeneratedError(error)
        if (!shouldRetry) {
          break
        }
      }
    }

    const fallbackFailures: string[] = []
    for (let attempt = 1; attempt <= JSON_FALLBACK_ATTEMPTS; attempt++) {
      try {
        const { text } = await generateText({
          model: createSolverModel(),
          prompt,
          system: `${SYSTEM_PROMPT}\n${JSON_FALLBACK_SYSTEM_PROMPT}`,
          abortSignal: AbortSignal.timeout(params.timeout),
        })

        const parsedOutput = parseSolverOutputFromText(text)
        if (parsedOutput.success) {
          return parsedOutput.data
        }

        const normalizedText = text.trim()
        fallbackFailures.push(
          normalizedText.length === 0
            ? `fallback attempt ${attempt}: no output generated`
            : `fallback attempt ${attempt}: invalid JSON output`
        )
      } catch (error) {
        fallbackFailures.push(
          `fallback attempt ${attempt}: ${getErrorMessage(error)}`
        )
      }
    }

    const originalMessage =
      getErrorMessage(structuredOutputError)
    const fallbackMessage =
      fallbackFailures.length > 0
        ? `; fallback failed: ${fallbackFailures.join('; ')}`
        : ''

    throw new Error(
      `solver did not return valid file output (structured output failed: ${originalMessage}${fallbackMessage})`
    )
  }

  try {
    return await runOnce()
  } catch (error) {
    if (!isRecoverableOpencodeError(error)) {
      throw error
    }

    await restartOpencodeServer({ timeout: params.timeout, port: params.port })

    try {
      return await runOnce()
    } catch (retryError) {
      const originalMessage = getErrorMessage(error)
      const retryMessage = getErrorMessage(retryError)
      throw new Error(
        `${retryMessage} (after OpenCode server restart; original error: ${originalMessage})`
      )
    }
  }
}
