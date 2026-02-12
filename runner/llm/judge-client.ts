import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { z } from 'zod'

const structuredOutputSchema = z.object({
  summary: z.string().optional(),
  requirements: z.array(
    z.object({
      id: z.string().min(1),
      passed: z.boolean(),
      reason: z.string().min(1),
      evidence: z.array(z.string()).default([]),
      confidence: z.number().min(0).max(1).optional(),
    }),
  ),
})

export type JudgeOutput = z.infer<typeof structuredOutputSchema>

/*
  Creates a single reusable judge client bound to one model/server config.
 */
export function createJudgeClient(config: {
  model: string
  timeoutMs: number
  port: number
}) {
  const provider = createOpencode({
    port: config.port,
    autoStartServer: true,
    serverTimeout: config.timeoutMs,
    defaultSettings: {
      cwd: process.cwd(),
      logger: false,
    },
  })

  return async (prompt: string) => {
    const response = await generateText({
      model: provider(config.model),
      prompt,
      output: Output.object({
        schema: structuredOutputSchema,
        name: 'eval_requirements_result',
        description: 'Requirement verdicts for a React Native eval',
      }),
    })

    return response.output
  }
}
