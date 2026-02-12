import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'bun:test'

import { loadRequirements } from '../requirements'

const tempRoots: string[] = []

afterAll(async () => {
  await Promise.all(
    tempRoots.map(async (tempRoot) => {
      await rm(tempRoot, { recursive: true, force: true })
    })
  )
})

describe('loadRequirements', () => {
  test('parses optional requirement weights', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'runner-requirements-')
    )
    tempRoots.push(tempRoot)

    const evalDir = path.join(tempRoot, 'eval')
    await mkdir(evalDir, { recursive: true })

    const yaml = [
      'version: 1',
      'requirements:',
      '  - id: uses-reanimated',
      '    description: Must use reanimated',
      '    weight: 2.5',
      '  - id: has-gesture',
      '    description: Must use gestures',
    ].join('\n')

    const requirementsPath = path.join(evalDir, 'requirements.yaml')
    await writeFile(requirementsPath, `${yaml}\n`)

    const parsed = await loadRequirements(requirementsPath)

    expect(parsed.requirements[0]?.weight).toBe(2.5)
    expect(parsed.requirements[1]?.weight).toBeUndefined()
  })
})
