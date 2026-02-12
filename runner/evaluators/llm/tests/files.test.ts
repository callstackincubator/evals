import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'bun:test'

import { collectMissingInputFiles, loadExampleFiles, loadInputFiles } from '../files'

const tempRoots: string[] = []

afterAll(async () => {
  await Promise.all(
    tempRoots.map(async (tempRoot) => {
      await rm(tempRoot, { recursive: true, force: true })
    })
  )
})

function makeRequirements(files: string[]) {
  return {
    version: 1,
    inputs: { files },
    requirements: [
      {
        id: 'r1',
        description: 'Must exist',
      },
    ],
  }
}

describe('files helpers', () => {
  test('collects missing declared input files', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const evalDir = path.join(tempRoot, 'eval')
    await mkdir(path.join(evalDir, 'app'), { recursive: true })
    await writeFile(path.join(evalDir, 'app', 'App.tsx'), 'x'.repeat(20))

    const requirements = makeRequirements(['app/App.tsx', 'app/package.json'])

    const missing = await collectMissingInputFiles(evalDir, requirements)
    expect(missing).toEqual(['app/package.json'])
  })

  test('loads declared files when all are present', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const evalDir = path.join(tempRoot, 'eval')
    await mkdir(path.join(evalDir, 'app'), { recursive: true })
    await writeFile(path.join(evalDir, 'app', 'App.tsx'), 'x'.repeat(20))

    const requirements = makeRequirements(['app/App.tsx'])
    const loaded = await loadInputFiles(evalDir, requirements)

    expect(loaded.length).toBe(1)
    expect(loaded[0]?.content.length).toBe(20)
  })

  test('loads guidance files from example directory', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-files-'))
    tempRoots.push(tempRoot)

    const evalDir = path.join(tempRoot, 'eval')
    await mkdir(path.join(evalDir, 'example', 'nested'), { recursive: true })
    await writeFile(path.join(evalDir, 'example', 'README.md'), 'guide')
    await writeFile(path.join(evalDir, 'example', 'nested', 'App.tsx'), 'code')

    const loaded = await loadExampleFiles(evalDir)

    expect(loaded.length).toBe(2)
    expect(loaded.some((file) => file.absolutePath.endsWith('example/README.md'))).toBe(true)
    expect(loaded.some((file) => file.absolutePath.endsWith('example/nested/App.tsx'))).toBe(true)
  })
})
