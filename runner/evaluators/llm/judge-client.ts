import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { z } from 'zod'
import {
  collectOpencodeSessionSnapshot,
  type OpencodeSessionSnapshot,
} from 'runner/utils/opencode-session'
import { ensureOpencodeServerStarted } from 'runner/utils/opencode'

const JSON_FALLBACK_SYSTEM_PROMPT = `
  Return only valid JSON matching this shape:
  {
    "summary": "optional short summary",
    "requirements": [
      {
        "id": "requirement-id",
        "passed": true,
        "reason": "short concrete reason",
        "evidence": ["short file/path or code evidence"],
        "confidence": 0.8
      }
    ]
  }
  Do not include markdown fences or extra text.
`

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

type JudgeCallResult = {
  summary?: string
  requirements: JudgeOutput['requirements']
  opencodeSession?: OpencodeSessionSnapshot
}

type RunJudgeCallOptions = {
  prompt: string
  model: string
  timeout: number
  port?: number
  directory?: string
}

function asRecord(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return undefined
  }

  return value as Record<string, unknown>
}

function extractOpencodeSessionId(response: unknown) {
  const responseRecord = asRecord(response)
  const providerMetadata = asRecord(responseRecord?.providerMetadata)
  const opencodeMetadata = asRecord(providerMetadata?.opencode)

  const maybeSessionId =
    opencodeMetadata?.sessionId ?? opencodeMetadata?.sessionID

  return typeof maybeSessionId === 'string' ? maybeSessionId : undefined
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
  options: RunJudgeCallOptions
): Promise<JudgeCallResult> {
  await ensureOpencodeServerStarted({ timeout: options.timeout, port: options.port })

  const provider = createOpencode({
    autoStartServer: false,
    port: options.port,
  })

  const judgeModel = provider(options.model, { createNewSession: true })

  try {
    const response = await generateText({
      model: judgeModel,
      prompt: options.prompt,
      abortSignal: AbortSignal.timeout(options.timeout),
      output: Output.object({
        schema: structuredOutputSchema,
        name: 'eval_requirements_result',
        description: 'Requirement verdicts for a React Native eval',
      }),
    })

    return {
      summary: response.output.summary,
      requirements: response.output.requirements,
      opencodeSession: await collectOpencodeSessionSnapshot({
        sessionId: extractOpencodeSessionId(response),
        port: options.port,
        directory: options.directory,
      }),
    }
  } catch (structuredOutputError) {
    const fallbackResponse = await generateText({
      model: judgeModel,
      prompt: options.prompt,
      system: JSON_FALLBACK_SYSTEM_PROMPT,
      abortSignal: AbortSignal.timeout(options.timeout),
    })

    const parsedOutput = parseJudgeOutputFromText(fallbackResponse.text)
    if (!parsedOutput.success) {
      const originalMessage =
        structuredOutputError instanceof Error
          ? structuredOutputError.message
          : String(structuredOutputError)
      throw new Error(
        `judge did not return valid requirement output (structured output failed: ${originalMessage})`
      )
    }

    return {
      summary: parsedOutput.data.summary,
      requirements: parsedOutput.data.requirements,
      opencodeSession: await collectOpencodeSessionSnapshot({
        sessionId: extractOpencodeSessionId(fallbackResponse),
        port: options.port,
        directory: options.directory,
      }),
    }
  }
}
