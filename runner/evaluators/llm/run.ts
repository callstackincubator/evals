import { runJudgeCall, type JudgeOutput } from './judge-client'
import { buildJudgePrompt } from './prompt'
import { loadRequirements, type RequirementDefinition } from './requirements'
import { computeScore, normalizeWeight } from './utils'
import type { LoadedFile } from 'runner/utils/fs'
import type { CliOptions } from 'runner/config'

// todo: this could be handled by structured output to make sure all requirements are satisfied
function mapRequirementResults(
  requirements: RequirementDefinition[],
  judgeRows: JudgeOutput['requirements']
) {
  const rowsById = new Map(judgeRows.map((row) => [row.id, row]))

  return requirements.map((requirement) => {
    const row = rowsById.get(requirement.id)
    const normalizedWeight = normalizeWeight(requirement.weight)

    if (!row) {
      return {
        id: requirement.id,
        description: requirement.description,
        weight: normalizedWeight,
        passed: false,
        reason: 'judge did not return a result for this requirement',
        evidence: [],
      }
    }

    return {
      ...requirement,
      ...row,
      weight: normalizedWeight,
    }
  })
}

/*
  Runs one LLM judge stage on generated files against declared requirements.
*/
export async function runLlmJudgeStage(
  files: LoadedFile[],
  referenceFiles: LoadedFile[],
  rawRequirements: string,
  cliOptions: CliOptions
) {
  if (!cliOptions.model) {
    return {
      requirements: [],
      summary: 'llm judge skipped: no --model provided',
      score: {
        passedWeight: 0,
        totalWeight: 0,
        ratio: 0,
      },
    }
  }

  const requirements = await loadRequirements(rawRequirements)

  const prompt = buildJudgePrompt(requirements, files)

  const results = await runJudgeCall(
    prompt,
    cliOptions.model,
    cliOptions.timeout,
    cliOptions.port
  )

  const mappedRequirements = mapRequirementResults(
    requirements,
    results.requirements
  )

  return {
    requirements: mappedRequirements,
    summary: results.summary,
    score: computeScore(mappedRequirements),
  }
}
