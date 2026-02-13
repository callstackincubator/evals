import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { z } from 'zod'
import { ensureOpencodeServerStarted } from 'runner/utils/opencode'

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

  const response = await generateText({
    model: provider(model, { createNewSession: true }),
    prompt,
    abortSignal: AbortSignal.timeout(timeout),
    output: Output.object({
      schema: structuredOutputSchema,
      name: 'eval_requirements_result',
      description: 'Requirement verdicts for a React Native eval',
    }),
  })

  return response.output
}
