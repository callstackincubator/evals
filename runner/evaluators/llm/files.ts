import { exists, readdir } from 'node:fs/promises'
import path from 'node:path'

import { loadFile, type LoadedFile } from 'runner/utils/fs'

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
  Loads all files from app/ as baseline input for benchmark generation.
*/
export async function loadAppFiles(evalPath: string): Promise<LoadedFile[]> {
  const appPath = path.join(evalPath, 'app')

  if (!(await exists(appPath))) {
    return []
  }

  const appFilePaths = (await collectFilesRecursively(appPath)).sort()

  return Promise.all(appFilePaths.map(async (filePath) => await loadFile(filePath)))
}

/*
  Loads all files from reference/ as judge reference context.
*/
export async function loadReferenceFiles(
  evalPath: string
): Promise<LoadedFile[]> {
  const referencePath = path.join(evalPath, 'reference')

  if (!(await exists(referencePath))) {
    return []
  }

  const referenceFilePaths = (await collectFilesRecursively(referencePath)).sort()

  return Promise.all(
    referenceFilePaths.map(async (filePath) => await loadFile(filePath))
  )
}
