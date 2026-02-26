import type { RequirementDefinition } from './requirements'
import type { LoadedFile } from 'runner/utils/fs'

/*
  Builds a judge prompt from requirements and generated source files.
*/
export function buildJudgePrompt(
  requirements: RequirementDefinition[],
  files: LoadedFile[]
) {
  const requirementsBlock = requirements
    .map((requirement) => {
      const weightText =
        requirement.weight !== undefined
          ? ` (weight: ${requirement.weight})`
          : ''
      return `- ${requirement.id}${weightText}: ${requirement.description}`
    })
    .join('\n')

  const filesBlock = files
    .map((file) => {
      return `
        ### FILE: ${file.path}

        \`\`\`
        ${file.content}
        \`\`\`
      `
    })
    .join('\n\n')

  return `
    You are reviewing a React Native code submission against an explicit acceptance criteria list.
    Decide pass/fail for each criterion based only on the submitted files.

    Rules:
    - Use only the submitted files as evidence.
    - Return exactly one result per declared requirement id.
    - Mark passed=false if evidence is missing or contradictory.
    - Keep reasons concise, concrete, and technically specific.

    Acceptance criteria:
    ${requirementsBlock}

    Submitted files:
    ${filesBlock}
  `
}
