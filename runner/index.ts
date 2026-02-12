import { runLlmJudgePipeline } from './llm/run'

try {
  await runLlmJudgePipeline()
  process.exit(0)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
