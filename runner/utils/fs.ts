import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

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

export function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}
