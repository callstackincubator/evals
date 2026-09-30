import { describe, expect, mock, test } from 'bun:test'
import { MockLanguageModelV3 } from 'ai/test'

let responses: string[] = []
let calls = 0

mock.module('runner/utils/opencode-model', () => ({
  createIsolatedOpencodeModel: () => ({
    model: new MockLanguageModelV3({
      doGenerate: async () => {
        const text = responses[Math.min(calls, responses.length - 1)] ?? ''
        calls += 1
        return {
          content: [{ type: 'text', text }],
          finishReason: { unified: 'stop', raw: 'stop' },
          usage: {
            inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
            outputTokens: { total: 1, text: 1, reasoning: 0 },
          },
          warnings: [],
        }
      },
    }),
    dispose: async () => {},
  }),
}))

mock.module('runner/utils/opencode-trace', () => ({
  logOpencodeTrace: () => {},
  runTracedOpencodeCall: (
    _tracer: unknown,
    _label: string,
    fn: () => unknown
  ) => fn(),
  startOpencodeCallTracer: () => ({ noteSessionId: () => {}, stop: () => {} }),
}))

mock.module('runner/utils/opencode-session', () => ({
  collectOpencodeSessionSnapshot: async () => undefined,
}))

const { runJudgeCall } = await import('../judge-client')

const verdict = JSON.stringify(
  {
    summary: 'ok',
    requirements: [
      { id: 'req-a', passed: true, reason: 'uses withTiming', evidence: [] },
    ],
  },
  null,
  2
)

async function judge(...answers: string[]) {
  responses = answers
  calls = 0
  const result = await runJudgeCall({
    prompt: 'judge this',
    model: 'mock/model',
    timeout: 5_000,
    port: 1,
  })
  return { result, calls }
}

describe('runJudgeCall fenced output handling', () => {
  test('fenced json parses on the first call', async () => {
    const { result, calls } = await judge('```json\n' + verdict + '\n```')
    expect(calls).toBe(1)
    expect(result.requirements[0]?.id).toBe('req-a')
  })

  test('fence without language tag parses on the first call', async () => {
    const { calls } = await judge('```\n' + verdict + '\n```')
    expect(calls).toBe(1)
  })

  test('prose with braces before fenced json parses on the first call', async () => {
    const { calls } = await judge(
      'Analysis: screens: {...} looks fine.\n\n```json\n' + verdict + '\n```'
    )
    expect(calls).toBe(1)
  })

  test('raw json parses on the first call', async () => {
    const { calls } = await judge(verdict)
    expect(calls).toBe(1)
  })

  test('prose before raw json is recovered without a second call', async () => {
    const { calls } = await judge('Output JSON:\n' + verdict)
    expect(calls).toBe(1)
  })

  test('code snippet fence before the json fence', async () => {
    const { calls } = await judge(
      'The submission has:\n```tsx\nscale.value = withTiming(1)\n```\n\n```json\n' +
        verdict +
        '\n```'
    )
    expect(calls).toBe(1)
  })

  test('schema-invalid fenced json falls back to a second call', async () => {
    const { calls, result } = await judge(
      '```json\n{"requirements":[{"id":"req-a"}]}\n```',
      '```json\n' + verdict + '\n```'
    )
    expect(calls).toBe(2)
    expect(result.requirements[0]?.passed).toBe(true)
  })

  test('unparseable output on both calls throws', async () => {
    await expect(judge('no json here', 'still none')).rejects.toThrow(
      'judge did not return valid requirement output'
    )
  })
})
