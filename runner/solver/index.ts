import { createOpenAI } from '@ai-sdk/openai'
import { Output, generateText } from 'ai'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

import type { RequirementsDefinition } from 'runner/evaluators/llm/requirements'
import type { LoadedFile } from 'runner/utils/fs'

const solverOutputSchema = z.object({
  summary: z.string().optional(),
  files: z.array(
    z.object({
      path: z.string().min(1),
      content: z.string().min(1),
    })
  ),
})

type SolverOutput = z.infer<typeof solverOutputSchema>

export type SolverResult = {
  files: LoadedFile[]
  summary?: string
  errors: string[]
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

function sanitizeGeneratedPath(relativePath: string) {
  const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\/+/, '')
  const segments = normalizedPath
    .split('/')
    .filter(Boolean)
    .filter((segment) => segment !== '.' && segment !== '..')

  return segments.join('/')
}

async function materializeFiles(
  outputDirectory: string,
  files: Array<{ path: string; content: string }>
): Promise<LoadedFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const safeRelativePath = sanitizeGeneratedPath(file.path)
      const absolutePath = path.join(outputDirectory, safeRelativePath)

      await mkdir(path.dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, file.content, 'utf8')

      return {
        path: toPosixPath(safeRelativePath),
        absolutePath,
        content: file.content,
      }
    })
  )
}

function buildSolverPrompt(params: {
  evalId: string
  requirements: RequirementsDefinition
  promptMarkdown: string
  inputFiles: LoadedFile[]
}) {
  const requirementsText = params.requirements.requirements
    .map((requirement) => `- ${requirement.id}: ${requirement.description}`)
    .join('\n')
  const inputFilesText = params.inputFiles
    .map((file) => {
      const fileLabel =
        file.path.length > 0
          ? file.path
          : toPosixPath(path.basename(file.absolutePath))
      return `
### FILE: ${fileLabel}
\`\`\`
${file.content}
\`\`\`
      `.trim()
    })
    .join('\n\n')

  return `
You are generating a placeholder React Native solution for eval "${params.evalId}".

Return a JSON object with:
- "summary": a brief explanation
- "files": an array of files to evaluate, each with:
  - "path": relative path like "app/App.tsx"
  - "content": file contents

You must return at least one file.

Eval prompt:
${params.promptMarkdown}

Requirements:
${requirementsText}

Current input files:
${inputFilesText}
`
}

/*
  Runs a placeholder OpenAI solver and materializes generated files for judges.
 */
export async function runSolver(params: {
  evalId: string
  model: string
  mockTestedLLM: boolean
  apiKey: string | null
  baseURL: string | null
  timeoutMs: number
  evalPath: string
  outputDirectory: string
  promptMarkdown: string
  requirements: RequirementsDefinition
  inputFiles: LoadedFile[]
}): Promise<SolverResult> {
  const errors: string[] = []

  if (params.mockTestedLLM) {
    console.warn(
      `(${params.evalId}) mockTestedLLM enabled: skipping solver model execution`
    )

    const files = await materializeFiles(
      params.outputDirectory,
      params.inputFiles.map((file) => ({
        path: toPosixPath(path.relative(params.evalPath, file.absolutePath)),
        content: file.content,
      }))
    )

    return {
      files,
      summary:
        'mockTestedLLM enabled: used current baseline files as generated output',
      errors: [],
    }
  }

  const provider = createOpenAI({
    apiKey: params.apiKey,
    baseURL: params.baseURL ?? undefined,
  })

  const prompt = buildSolverPrompt({
    evalId: params.evalId,
    requirements: params.requirements,
    promptMarkdown: params.promptMarkdown,
    inputFiles: params.inputFiles,
  })

  try {
    const response = await generateText({
      model: provider(params.model),
      prompt,
      abortSignal: AbortSignal.timeout(params.timeoutMs),
      output: Output.object({
        schema: solverOutputSchema,
        name: 'solver_output',
        description: 'Generated placeholder files for eval execution',
      }),
    })

    const solverOutput: SolverOutput = response.output
    const hasFile = solverOutput.files.length > 0
    if (!hasFile) {
      throw new Error('solver produced no files')
    }

    const files = await materializeFiles(
      params.outputDirectory,
      solverOutput.files
    )
    return {
      files,
      summary: solverOutput.summary,
      errors,
    }
  } catch (error) {
    errors.push(
      `solver error: ${error instanceof Error ? error.message : String(error)}`
    )

    const fallbackFiles = await materializeFiles(
      params.outputDirectory,
      params.inputFiles.map((file) => ({
        path: toPosixPath(path.relative(params.evalPath, file.absolutePath)),
        content: file.content,
      }))
    )

    return {
      files: fallbackFiles,
      errors,
    }
  }
}
