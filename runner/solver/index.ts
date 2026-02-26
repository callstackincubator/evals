import { Output, generateText } from 'ai'
import { createOpencode } from 'ai-sdk-provider-opencode-sdk'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

import { ensureOpencodeServerStarted } from 'runner/utils/opencode'
import type { LoadedFile } from 'runner/utils/fs'

const SYSTEM_PROMPT = `
  You are a React Native developer.
  Your goal is to modify provided files to satisfy given task.
  You must return all given files with applied modification.
`

const JSON_FALLBACK_SYSTEM_PROMPT = `
  Return only valid JSON matching this shape:
  {
    "summary": "short summary",
    "files": [{ "path": "relative/path.ext", "content": "full file contents" }]
  }
  Do not include markdown fences or any extra text.
`

const solverOutputSchema = z.object({
  summary: z.string().describe('Short summary of performed work'),
  files: z
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
      })
    )
    .min(1),
})

export type SolverResult = {
  files: LoadedFile[]
  summary?: string
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

export async function materializeFiles(
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

function buildSolverPrompt(prompt: string, inputFiles: LoadedFile[]) {
  const files = inputFiles
    .map((file) => {
      return `
        <file path="${file.path}">
          ${file.content}
        </file>
      `
    })
    .join('\n\n')

  return `
    ${prompt}

    <files>
    ${files}
    </files>
  `
}

function parseSolverOutputFromText(rawText: string) {
  const normalized = rawText.trim()
  const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const fencedCandidate = fencedMatch?.[1]?.trim()

  const candidates = [fencedCandidate, normalized]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => {
      const firstBrace = value.indexOf('{')
      const lastBrace = value.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        return [value]
      }

      return [value, value.slice(firstBrace, lastBrace + 1)]
    })

  for (const candidate of candidates) {
    try {
      const parsedJson = JSON.parse(candidate)
      const parsed = solverOutputSchema.safeParse(parsedJson)
      if (parsed.success) {
        return parsed
      }
    } catch {
      continue
    }
  }

  return solverOutputSchema.safeParse(null)
}

/*
  Runs an OpenCode-backed solver and materializes generated files for judges.
*/
export async function runSolver(params: {
  prompt: string
  files: LoadedFile[]
  workingDirectory: string
  model: string
  timeout: number
  port?: number
}) {
  await ensureOpencodeServerStarted(params)

  const provider = createOpencode({
    port: params.port,
    autoStartServer: false,
  })

  const prompt = buildSolverPrompt(params.prompt, params.files)
  const model = provider(params.model, {
    createNewSession: true,
    directory: params.workingDirectory,
    cwd: params.workingDirectory,
  })

  try {
    const { output } = await generateText({
      model,
      prompt,
      system: SYSTEM_PROMPT,
      abortSignal: AbortSignal.timeout(params.timeout),
      output: Output.object({
        schema: solverOutputSchema,
        description: 'Generated files that satisfy the task',
      }),
    })

    return output
  } catch (structuredOutputError) {
    const { text } = await generateText({
      model,
      prompt,
      system: `${SYSTEM_PROMPT}\n${JSON_FALLBACK_SYSTEM_PROMPT}`,
      abortSignal: AbortSignal.timeout(params.timeout),
    })

    const parsedOutput = parseSolverOutputFromText(text)
    if (!parsedOutput.success) {
      const originalMessage =
        structuredOutputError instanceof Error
          ? structuredOutputError.message
          : String(structuredOutputError)
      throw new Error(
        `solver did not return valid file output (structured output failed: ${originalMessage})`
      )
    }

    return parsedOutput.data
  }
}
