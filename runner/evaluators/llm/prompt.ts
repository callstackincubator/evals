import type { RequirementDefinition } from './requirements'
import type { LoadedFile } from 'runner/utils/fs'

/*
  Builds a judge prompt from requirements and generated source files.
*/
export function buildJudgePrompt(
  requirements: RequirementDefinition[],
  files: LoadedFile[],
  referenceFiles: LoadedFile[] = []
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

  const referenceBlock =
    referenceFiles.length > 0
      ? `
    Reference files (expected correct implementation):
    ${referenceFiles
      .map((file) => {
        return `
        ### FILE: ${file.path}

        \`\`\`
        ${file.content}
        \`\`\`
        `
      })
      .join('\n\n')}
    `
      : ''

  return `
    You are reviewing a React Native code submission against an explicit acceptance criteria list.
    Decide pass/fail for each criterion based on the submitted files.

    Rules:
    - Use the submitted files as primary evidence.${referenceBlock ? '\n    - Compare against the reference files when available.' : ''}
    - Return exactly one result per declared requirement id.
    - Mark passed=false if evidence is missing or contradictory.
    - Keep reasons concise, concrete, and technically specific.

    Acceptance criteria:
    ${requirementsBlock}

    Submitted files:
    ${filesBlock}${referenceBlock}
  `
}
