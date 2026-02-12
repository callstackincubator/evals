import { exists, readFile } from 'node:fs/promises'
import path from 'node:path'

import type { RequirementsDefinition } from './requirements'

export type LoadedInputFile = {
  path: string
  absolutePath: string
  content: string
}

/*
  Resolves and validates an input file path inside a single eval directory.
 */
function resolveInputPath(evalPath: string, relativeFilePath: string) {
  const absoluteEvalPath = path.resolve(evalPath)
  const resolvedPath = path.resolve(absoluteEvalPath, relativeFilePath)

  if (resolvedPath === absoluteEvalPath) {
    return resolvedPath
  }

  const safePrefix = `${absoluteEvalPath}${path.sep}`
  if (!resolvedPath.startsWith(safePrefix)) {
    throw new Error(`input file escapes eval directory: ${relativeFilePath}`)
  }

  return resolvedPath
}

/*
  Returns declared input files that are missing on disk for a given eval.
 */
export async function collectMissingInputFiles(
  evalPath: string,
  requirements: RequirementsDefinition,
) {
  const results = await Promise.all(
    requirements.inputs.files.map(async (relativeFilePath) => {
      const absolutePath = resolveInputPath(evalPath, relativeFilePath)
      return (await exists(absolutePath)) ? null : relativeFilePath
    }),
  )

  return results.filter((filePath): filePath is string => filePath !== null)
}

/*
  Loads declared input files and returns their relative paths and content.
 */
export async function loadInputFiles(
  evalPath: string,
  requirements: RequirementsDefinition,
) {
  return Promise.all(
    requirements.inputs.files.map(async (relativeFilePath) => {
      const absolutePath = resolveInputPath(evalPath, relativeFilePath)
      const raw = await readFile(absolutePath, 'utf8')

      return {
        path: relativeFilePath,
        absolutePath,
        content: raw,
      }
    }),
  )
}
