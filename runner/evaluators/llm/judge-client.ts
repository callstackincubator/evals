import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { z } from 'zod'
import {
  OPENCODE_NO_TOOLS,
  ensureOpencodeServerStarted,
  isRecoverableOpencodeError,
  restartOpencodeServer,
} from 'runner/utils/opencode'
import {
  JUDGE_JSON_FALLBACK_SYSTEM_PROMPT,
  JUDGE_OPENCODE_MODEL_SETTINGS,
  JUDGE_STRUCTURED_OUTPUT_ATTEMPTS,
  JUDGE_JSON_FALLBACK_ATTEMPTS,
} from 'runner/deterministic_model_config/judge'

const JSON_FALLBACK_SYSTEM_PROMPT = JUDGE_JSON_FALLBACK_SYSTEM_PROMPT

const OPENCODE_MODEL_SETTINGS = {
  ...JUDGE_OPENCODE_MODEL_SETTINGS,
  tools: OPENCODE_NO_TOOLS,
} as const

const structuredOutputSchema = z.object({
  summary: z.string().optional(),
  requirements: z.array(
    z.object({
      id: z.string().min(1),
      passed: z.boolean(),
      reason: z.string().min(1),
      evidence: z.array(z.string()).default([]),
      confidence: z.number().min(0).max(1).optional(),
    })
  ),
})

export type JudgeOutput = z.infer<typeof structuredOutputSchema>

const STRUCTURED_OUTPUT_ATTEMPTS = JUDGE_STRUCTURED_OUTPUT_ATTEMPTS
const JSON_FALLBACK_ATTEMPTS = JUDGE_JSON_FALLBACK_ATTEMPTS

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function isNoOutputGeneratedError(error: unknown) {
  return /no output generated/i.test(getErrorMessage(error))
}

function parseJudgeOutputFromText(rawText: string) {
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
      const parsed = structuredOutputSchema.safeParse(parsedJson)
      if (parsed.success) {
        return parsed
      }
    } catch {
      continue
    }
  }

  return structuredOutputSchema.safeParse(null)
}

/*
  Runs one LLM judge call with structured output.
 */
export async function runJudgeCall(
  prompt: string,
  model: string,
  timeout: number,
  port?: number
) {
  const runOnce = async () => {
    await ensureOpencodeServerStarted({ timeout, port })

    const provider = createOpencode({
      autoStartServer: false,
      port,
    })

    const createJudgeModel = () => provider(model, OPENCODE_MODEL_SETTINGS)

    let structuredOutputError: unknown = null
    for (let attempt = 1; attempt <= STRUCTURED_OUTPUT_ATTEMPTS; attempt++) {
      try {
        const response = await generateText({
          model: createJudgeModel(),
          prompt,
          abortSignal: AbortSignal.timeout(timeout),
          output: Output.object({
            schema: structuredOutputSchema,
            name: 'eval_requirements_result',
            description: 'Requirement verdicts for a React Native eval',
          }),
        })

        return response.output
      } catch (error) {
        const finishReason = (error as { finishReason?: string })?.finishReason
        const detail = finishReason ? ` (finishReason=${finishReason})` : ''
        structuredOutputError = new Error(
          `${getErrorMessage(error)}${detail} [attempt ${attempt}/${STRUCTURED_OUTPUT_ATTEMPTS}]`
        )
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
        const response = await generateText({
          model: createJudgeModel(),
          prompt,
          system: JSON_FALLBACK_SYSTEM_PROMPT,
          abortSignal: AbortSignal.timeout(timeout),
        })

        const text = response.text ?? ''
        const parsedOutput = parseJudgeOutputFromText(text)
        if (parsedOutput.success) {
          return parsedOutput.data
        }

        const normalizedText = text.trim()
        const finishReason = response.finishReason ?? 'unknown'
        const usage = response.usage
          ? `in=${response.usage.inputTokens ?? '?'},out=${response.usage.outputTokens ?? '?'}`
          : 'n/a'
        fallbackFailures.push(
          normalizedText.length === 0
            ? `fallback attempt ${attempt}: no output generated (finishReason=${finishReason}, usage=${usage})`
            : `fallback attempt ${attempt}: invalid JSON output (finishReason=${finishReason}, len=${normalizedText.length})`
        )
      } catch (error) {
        fallbackFailures.push(
          `fallback attempt ${attempt}: ${getErrorMessage(error)}`
        )
      }
    }

    const originalMessage = getErrorMessage(structuredOutputError)
    const fallbackMessage =
      fallbackFailures.length > 0
        ? `; fallback failed: ${fallbackFailures.join('; ')}`
        : ''

    throw new Error(
      `judge did not return valid requirement output (structured output failed: ${originalMessage}${fallbackMessage})`
    )
  }

  try {
    return await runOnce()
  } catch (error) {
    if (!isRecoverableOpencodeError(error)) {
      throw error
    }

    await restartOpencodeServer({ timeout, port })

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
