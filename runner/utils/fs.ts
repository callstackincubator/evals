import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { Glob } from 'bun'

export type LoadedFile = {
  path: string
  absolutePath: string
  content: string
}

export async function hashDirectory(absolutePath: string): Promise<string> {
  const files = await readdir(absolutePath)
  const fileContents = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(absolutePath, file)
      const content = await readFile(filePath, 'utf8')
      return { filePath, content }
    })
  )

  return createHash('sha256')
    .update(
      fileContents
        .map(({ filePath, content }) => `${filePath}\0${content}`)
        .join('')
    )
    .digest('hex')
}

export async function loadFile(absolutePath: string): Promise<LoadedFile> {
  const raw = await readFile(absolutePath, 'utf8')

  return {
    path: absolutePath,
    absolutePath,
    content: raw,
  }
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  )
}

export async function loadFiles(dir: string): Promise<LoadedFile[]> {
  const glob = new Glob('**/*')
  const loadedFiles: LoadedFile[] = []

  try {
    for await (const filePath of glob.scan({
      cwd: dir,
      onlyFiles: true,
    })) {
      const absolutePath = path.join(dir, filePath)
      const content = await readFile(absolutePath, 'utf8')
      loadedFiles.push({
        path: filePath,
        absolutePath,
        content,
      })
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      return []
    }
    throw error
  }

  return loadedFiles.map((file) => ({
    ...file,
    path: file.path,
    absolutePath: path.resolve(file.absolutePath),
  }))
}

export function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_')
}
