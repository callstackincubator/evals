import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'bun:test'

import { loadAppFiles, loadReferenceFiles } from '../files'

const tempRoots: string[] = []

afterAll(async () => {
  await Promise.all(
    tempRoots.map(async (tempRoot) => {
      await rm(tempRoot, { recursive: true, force: true })
    })
  )
})

describe('files helpers', () => {
  test('loads guidance files from reference directory', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const evalDir = path.join(tempRoot, 'eval')
    await mkdir(path.join(evalDir, 'reference', 'nested'), { recursive: true })
    await writeFile(path.join(evalDir, 'reference', 'README.md'), 'guide')
    await writeFile(path.join(evalDir, 'reference', 'nested', 'App.tsx'), 'code')

    const loaded = await loadReferenceFiles(evalDir)

    expect(loaded.length).toBe(2)
    expect(loaded.some((file) => file.absolutePath.endsWith('reference/README.md'))).toBe(true)
    expect(loaded.some((file) => file.absolutePath.endsWith('reference/nested/App.tsx'))).toBe(true)
  })

  test('loads baseline app files recursively from app directory', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const evalDir = path.join(tempRoot, 'eval')
    await mkdir(path.join(evalDir, 'app', 'nested'), { recursive: true })
    await writeFile(path.join(evalDir, 'app', 'App.tsx'), 'app-root')
    await writeFile(path.join(evalDir, 'app', 'nested', 'helper.ts'), 'app-nested')

    const loaded = await loadAppFiles(evalDir)

    expect(loaded.length).toBe(2)
    expect(loaded.some((file) => file.absolutePath.endsWith('app/App.tsx'))).toBe(true)
    expect(loaded.some((file) => file.absolutePath.endsWith('app/nested/helper.ts'))).toBe(true)
  })
})
