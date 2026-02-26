import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'bun:test'

import { loadFiles } from '../../../utils/fs'

const tempRoots: string[] = []

afterAll(async () => {
  await Promise.all(
    tempRoots.map(async (tempRoot) => {
      await rm(tempRoot, { recursive: true, force: true })
    })
  )
})

describe('files helpers', () => {
  test('loads files recursively from the provided directory', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const rootDir = path.join(tempRoot, 'root')
    await mkdir(path.join(rootDir, 'nested'), { recursive: true })
    await writeFile(path.join(rootDir, 'README.md'), 'guide')
    await writeFile(path.join(rootDir, 'nested', 'App.tsx'), 'code')

    const loaded = await loadFiles(rootDir)

    expect(loaded.length).toBe(2)
    expect(
      loaded.some((file) => file.absolutePath.endsWith('root/README.md'))
    ).toBe(true)
    expect(
      loaded.some((file) => file.absolutePath.endsWith('root/nested/App.tsx'))
    ).toBe(true)
  })

  test('returns empty array when directory does not exist', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const loaded = await loadFiles(path.join(tempRoot, 'missing'))

    expect(loaded.length).toBe(0)
  })
})
