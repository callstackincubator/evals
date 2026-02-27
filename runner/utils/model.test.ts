import { describe, expect, test } from 'bun:test'

import { OPENAI_CODEX_53_MODEL, isOpenAiModel, normalizeModelId } from './model'

describe('normalizeModelId', () => {
  test('normalizes codex aliases to the canonical gpt-5.3 codex model id', () => {
    const aliases = [
      'openai/codex',
      'codex',
      'codex 5.3',
      'codex-5.3',
      'gpt-5.3-codex',
      'openai/gpt-5.3-codex',
    ]

    for (const alias of aliases) {
      expect(normalizeModelId(alias)).toBe(OPENAI_CODEX_53_MODEL)
    }
  })

  test('preserves unrelated model ids', () => {
    expect(normalizeModelId('llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M')).toBe(
      'llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M'
    )
  })
})

describe('isOpenAiModel', () => {
  test('detects codex aliases as openai models after normalization', () => {
    expect(isOpenAiModel('openai/codex')).toBe(true)
    expect(isOpenAiModel('codex 5.3')).toBe(true)
    expect(isOpenAiModel('llamacpp/foo')).toBe(false)
  })
})
