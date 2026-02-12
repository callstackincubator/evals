import { exists, readdir } from 'node:fs/promises'
import path from 'node:path'

import type { RequirementsDefinition } from './requirements'
import { loadFile, type LoadedFile } from 'runner/utils/fs'

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
  requirements: RequirementsDefinition
) {
  const results = await Promise.all(
    requirements.inputs.files.map(async (relativeFilePath) => {
      const absolutePath = resolveInputPath(evalPath, relativeFilePath)
      return (await exists(absolutePath)) ? null : relativeFilePath
    })
  )

  return results.filter((filePath): filePath is string => filePath !== null)
}

/*
  Loads declared input files and returns their relative paths and content.
 */
export async function loadInputFiles(
  evalPath: string,
  requirements: RequirementsDefinition
) {
  return Promise.all(
    requirements.inputs.files.map(async (relativeFilePath) => {
      const absolutePath = resolveInputPath(evalPath, relativeFilePath)
      return await loadFile(absolutePath)
    })
  )
}

async function collectFilesRecursively(
  directoryPath: string
): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const nestedPaths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name)
      if (entry.isDirectory()) {
        return await collectFilesRecursively(entryPath)
      }
      if (entry.isFile()) {
        return [entryPath]
      }
      return []
    })
  )

  return nestedPaths.flat()
}

/*
  Loads all files from example/ when present for optional prompt guidance.
 */
export async function loadExampleFiles(
  evalPath: string
): Promise<LoadedFile[]> {
  const examplePath = path.join(evalPath, 'example')

  if (!(await exists(examplePath))) {
    return []
  }

  const exampleFilePaths = (await collectFilesRecursively(examplePath)).sort()

  return Promise.all(
    exampleFilePaths.map(async (filePath) => await loadFile(filePath))
  )
}
