import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { createOpencodeServer } from '@opencode-ai/sdk/v2/server'
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
    })
  ),
})

export type JudgeOutput = z.infer<typeof structuredOutputSchema>

let serverPromise: Promise<void> | undefined

async function ensureOpencodeServerStarted(config: {
  port: number
  timeoutMs: number
}) {
  if (!serverPromise) {
    serverPromise = (async () => {
      await createOpencodeServer({
        port: config.port,
        timeout: config.timeoutMs,
      })
    })()
  }

  await serverPromise
}

/*
  Creates a single reusable judge client bound to one model/server config.
 */
export function createJudgeClient(config: {
  model: string
  timeoutMs: number
  port: number
}) {
  const provider = createOpencode({
    baseUrl: `http://127.0.0.1:${config.port}`,
    autoStartServer: false,
    defaultSettings: {
      cwd: process.cwd(),
      logger: false,
    },
  })

  return async (prompt: string) => {
    await ensureOpencodeServerStarted(config)

    const response = await generateText({
      model: provider(config.model, { createNewSession: true }),
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
