import path from 'node:path'

import { materializeFiles } from 'runner/solver'
import type { LoadedFile } from 'runner/utils/fs'

function toWorkspaceFile(relativeDir: string, file: LoadedFile) {
  return {
    path: path.join(relativeDir, file.path),
    content: file.content,
  }
}

/*
  Materializes the solver OpenCode workspace with only task inputs.
*/
export async function materializeSolverWorkspace(
  workspace: string,
  prompt: string,
  appFiles: LoadedFile[]
) {
  await materializeFiles(workspace, [
    { path: 'prompt.md', content: prompt },
    ...appFiles.map((file) => toWorkspaceFile('app', file)),
  ])
}

type JudgeWorkspaceInput = {
  requirements: string
  referenceFiles: LoadedFile[]
  generatedFiles: LoadedFile[]
  prompt?: string
}

/*
  Materializes the judge OpenCode workspace with grading context and submission.
*/
export async function materializeJudgeWorkspace(
  workspace: string,
  input: JudgeWorkspaceInput
) {
  const files = [
    { path: 'requirements.yaml', content: input.requirements },
    ...input.referenceFiles.map((file) => toWorkspaceFile('reference', file)),
    ...input.generatedFiles.map((file) => toWorkspaceFile('generated', file)),
  ]

  if (input.prompt) {
    files.push({ path: 'prompt.md', content: input.prompt })
  }

  await materializeFiles(workspace, files)
}
