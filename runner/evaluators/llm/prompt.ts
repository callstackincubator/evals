import dedent from 'dedent'
import type { RequirementsDefinition } from './requirements'
import type { LoadedFile } from 'runner/utils/fs'

/*
  Renders the final instruction block consumed by the structured judge call.
 */
function renderEvalRequirementsPrompt(
  requirementsBlock: string,
  filesBlock: string,
  exampleFileContents: LoadedFile[]
) {
  return dedent(
    `
    Evaluate this React Native eval implementation against the declared requirements.

    Rules:
    - Use only the provided files as evidence.
    - Return one result per declared requirement id.
    - Mark passed=false if evidence is missing or contradictory.
    - Keep reasons concise and concrete.

    Requirements:
    ${requirementsBlock}

    Provided files:
    ${filesBlock}
  ` +
      (exampleFileContents.length > 0
        ? `
    Example correct approach guidelines:
    ${exampleFileContents.map(({ content }) => content.trim()).join('\n\n')}
    `
        : '')
  )
}

/*
  Builds a judge prompt from requirements and loaded eval source files.
 */
export function buildJudgePrompt(
  requirements: RequirementsDefinition,
  files: LoadedFile[],
  exampleFileContents: LoadedFile[]
) {
  const requirementsBlock = requirements.requirements
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

  return renderEvalRequirementsPrompt(
    requirementsBlock,
    filesBlock,
    exampleFileContents
  )
}
