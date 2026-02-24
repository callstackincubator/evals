import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { z } from 'zod'
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
  await ensureOpencodeServerStarted({ timeout, port })

  const provider = createOpencode({
    autoStartServer: false,
    port,
  })

  const judgeModel = provider(model, { createNewSession: true })

  try {
    const response = await generateText({
      model: judgeModel,
      prompt,
      abortSignal: AbortSignal.timeout(timeout),
      output: Output.object({
        schema: structuredOutputSchema,
        name: 'eval_requirements_result',
        description: 'Requirement verdicts for a React Native eval',
      }),
    })

    return response.output
  } catch (structuredOutputError) {
    const { text } = await generateText({
      model: judgeModel,
      prompt,
      system: JSON_FALLBACK_SYSTEM_PROMPT,
      abortSignal: AbortSignal.timeout(timeout),
    })

    const parsedOutput = parseJudgeOutputFromText(text)
    if (!parsedOutput.success) {
      const originalMessage =
        structuredOutputError instanceof Error
          ? structuredOutputError.message
          : String(structuredOutputError)
      throw new Error(
        `judge did not return valid requirement output (structured output failed: ${originalMessage})`
      )
    }

    return parsedOutput.data
  }
}
