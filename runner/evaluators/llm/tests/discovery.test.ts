import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'bun:test'

import { discoverEvals } from '../../../utils/discovery'

const tempRoots: string[] = []

afterAll(async () => {
  await Promise.all(
    tempRoots.map(async (tempRoot) => {
      await rm(tempRoot, { recursive: true, force: true })
    })
  )
})

describe('discoverEvals', () => {
  test('discovers nested requirements files with stable eval ids', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'runner-discovery-'))
    tempRoots.push(tempRoot)

    const evalsRoot = path.join(tempRoot, 'evals')
    const evalOne = path.join(evalsRoot, 'animation', '01-case')
    const evalTwo = path.join(evalsRoot, 'navigation', '02-case')

    await mkdir(evalOne, { recursive: true })
    await mkdir(evalTwo, { recursive: true })

    await writeFile(
      path.join(evalOne, 'requirements.yaml'),
      'version: 1\nrequirements: [{id: a, description: b}]\n'
    )
    await writeFile(
      path.join(evalTwo, 'requirements.yaml'),
      'version: 1\nrequirements: [{id: c, description: d}]\n'
    )

    const previousCwd = process.cwd()
    process.chdir(tempRoot)

    try {
      const results = await discoverEvals()

      expect(results.length).toBe(2)
      expect(results[0]?.evalId).toBe('01-case')
      expect(results[1]?.evalId).toBe('02-case')
      expect(results[0]?.evalPath.endsWith('/evals/animation/01-case')).toBe(
        true
      )
    } finally {
      process.chdir(previousCwd)
    }
  })
})
