import { parseCliArgs } from './config'
import { runLlmJudgePipeline } from './evaluators/llm/run'

try {
  const cliOptions = await parseCliArgs()

  await runLlmJudgePipeline(cliOptions)
  process.exit(0)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
