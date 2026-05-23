import { runJudgeCall, type JudgeOutput } from './judge-client'
import { buildJudgePrompt } from './prompt'
import { loadRequirements, type RequirementDefinition } from './requirements'
import { computeScore, normalizeWeight } from './utils'
import type { LoadedFile } from 'runner/utils/fs'
import {
  cleanupOpencodeTempDir,
  createOpencodeTempDir,
  runWithOpencodeDockerServer,
} from 'runner/utils/opencode'
import { materializeJudgeWorkspace } from 'runner/utils/opencode-workspace'

type LlmJudgeStageOptions = {
  model: string
  timeout: number
  port?: number
  requirementIds?: string[]
}

type JudgeStageInput = {
  requirements: string
  referenceFiles: LoadedFile[]
  generatedFiles: LoadedFile[]
  prompt?: string
}

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
  input: JudgeStageInput,
  cliOptions: LlmJudgeStageOptions
) {
  const requirements = await loadRequirements(input.requirements)
  const requirementIdsFilter = cliOptions.requirementIds
  const selectedRequirements = requirementIdsFilter
    ? requirements.filter((requirement) =>
        requirementIdsFilter.includes(requirement.id)
      )
    : requirements

  if (selectedRequirements.length === 0) {
    throw new Error('no requirements matched requirement filter')
  }

  if (
    requirementIdsFilter &&
    selectedRequirements.length !== requirementIdsFilter.length
  ) {
    const selectedIds = new Set(selectedRequirements.map((item) => item.id))
    const missingIds = requirementIdsFilter.filter((id) => !selectedIds.has(id))
    throw new Error(
      `missing requirement ids for judge rerun: ${missingIds.join(', ')}`
    )
  }

  const hostWorkspace = await createOpencodeTempDir()

  try {
    await materializeJudgeWorkspace(hostWorkspace, input)

    return await runWithOpencodeDockerServer(
      {
        hostWorkspace,
        timeout: cliOptions.timeout,
        port: cliOptions.port,
      },
      async (server) => {
        const prompt = buildJudgePrompt(
          selectedRequirements,
          input.generatedFiles
        )

        const judgeCall = await runJudgeCall({
          prompt,
          model: cliOptions.model,
          timeout: cliOptions.timeout,
          port: server.port,
          cwd: server.containerWorkspace,
          directory: server.containerWorkspace,
        })

        const mappedRequirements = mapRequirementResults(
          selectedRequirements,
          judgeCall.requirements
        )

        return {
          requirements: mappedRequirements,
          summary: judgeCall.summary,
          score: computeScore(mappedRequirements),
          opencodeSession: judgeCall.opencodeSession,
        }
      }
    )
  } finally {
    await cleanupOpencodeTempDir(hostWorkspace)
  }
}
