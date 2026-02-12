import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs as parseArgv } from 'node:util'
import { z } from 'zod'

const runnerConfigSchema = z.object({
  concurrency: z.number().int().positive().default(4),
  model: z.string().min(1).default('openai/gpt-5.3-codex'),
  solverModel: z.string().min(1).default('gpt-4.1-mini'),
  mockTestedLLM: z.boolean().default(false),
  mockJudgeLLM: z.boolean().default(false),
  apiKey: z.string().min(1).nullable().default(null),
  baseURL: z.string().min(1).nullable().default(null),
  pattern: z.string().min(1).default('**/requirements.yaml'),
  timeout: z.number().int().positive().default(120000),
  port: z.number().int().positive().default(4096),
  solverTimeout: z.number().int().positive().default(120000),
})

const RUNNER_CONFIG_PATH = path.resolve(process.cwd(), 'config.json')

/*
  Parses CLI flags and returns normalized runner settings.
 */
export async function parseCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'debug': { type: 'boolean', default: false },
      'fail-fast': { type: 'boolean', default: false },
      'just-one': { type: 'boolean', default: false },
    },
    strict: true,
    allowPositionals: false,
  })

  const configRaw = await readFile(RUNNER_CONFIG_PATH, 'utf8')
  const parsedConfig = runnerConfigSchema.parse(JSON.parse(configRaw))

  if (!parsedConfig.mockTestedLLM && !parsedConfig.apiKey) {
    throw new Error(
      'config.json must provide "apiKey" unless "mockTestedLLM" is true'
    )
  }

  return {
    concurrency: parsedConfig.concurrency,
    debug: values.debug ?? false,
    model: parsedConfig.model,
    solverModel: parsedConfig.solverModel,
    mockTestedLLM: parsedConfig.mockTestedLLM,
    mockJudgeLLM: parsedConfig.mockJudgeLLM,
    apiKey: parsedConfig.apiKey,
    baseURL: parsedConfig.baseURL,
    pattern: parsedConfig.pattern,
    timeout: parsedConfig.timeout,
    port: parsedConfig.port,
    solverTimeout: parsedConfig.solverTimeout,
    failFast: values['fail-fast'] ?? false,
    justOne: values['just-one'] ?? false,
  }
}

export type CliOptions = Awaited<ReturnType<typeof parseCliArgs>>
