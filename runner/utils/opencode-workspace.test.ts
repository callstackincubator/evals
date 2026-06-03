import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, test } from 'bun:test'

import {
  materializeJudgeWorkspace,
  materializeSolverWorkspace,
} from './opencode-workspace'
import { cleanupOpencodeTempDir, createOpencodeTempDir } from './opencode'

describe('opencode workspace materialization', () => {
  test('solver workspace contains only prompt.md and app files', async () => {
    const workspace = await createOpencodeTempDir()

    try {
      await materializeSolverWorkspace(workspace, 'Implement the task.', [
        {
          path: 'App.tsx',
          absolutePath: '/unused/App.tsx',
          content: 'export default function App() {}',
        },
      ])

      await access(path.join(workspace, 'prompt.md'))
      await access(path.join(workspace, 'app', 'App.tsx'))
      await expect(
        access(path.join(workspace, 'requirements.yaml'))
      ).rejects.toThrow()
      await expect(access(path.join(workspace, 'reference'))).rejects.toThrow()
    } finally {
      await cleanupOpencodeTempDir(workspace)
    }
  })

  test('judge workspace contains requirements, reference, and generated files', async () => {
    const workspace = await createOpencodeTempDir()

    try {
      await materializeJudgeWorkspace(workspace, {
        requirements: 'version: 1\nrequirements: []\n',
        referenceFiles: [
          {
            path: 'App.tsx',
            absolutePath: '/unused/reference/App.tsx',
            content: 'export default function Reference() {}',
          },
        ],
        generatedFiles: [
          {
            path: 'App.tsx',
            absolutePath: '/unused/generated/App.tsx',
            content: 'export default function Submission() {}',
          },
        ],
        prompt: 'Task prompt',
      })

      await access(path.join(workspace, 'requirements.yaml'))
      await access(path.join(workspace, 'prompt.md'))
      await access(path.join(workspace, 'reference', 'App.tsx'))
      await access(path.join(workspace, 'generated', 'App.tsx'))

      const requirements = await readFile(
        path.join(workspace, 'requirements.yaml'),
        'utf8'
      )
      expect(requirements).toContain('version: 1')
    } finally {
      await cleanupOpencodeTempDir(workspace)
    }
  })
})
