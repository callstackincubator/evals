const OPENAI_CODEX_53_MODEL = 'openai/gpt-5.3-codex'

function toAliasKey(model: string) {
  return model.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/*
  Normalizes user-facing model aliases to canonical provider/model ids.
*/
export function normalizeModelId(model: string | null | undefined) {
  if (typeof model !== 'string') {
    return model ?? undefined
  }

  const trimmed = model.trim()
  if (!trimmed) {
    return ''
  }

  const lower = trimmed.toLowerCase()
  if (lower === OPENAI_CODEX_53_MODEL) {
    return OPENAI_CODEX_53_MODEL
  }

  const aliasKey = toAliasKey(trimmed)
  if (
    aliasKey === 'openaicodex' ||
    aliasKey === 'codex' ||
    aliasKey === 'openaicodex53' ||
    aliasKey === 'codex53' ||
    aliasKey === 'gpt53codex' ||
    aliasKey === 'openaigpt53codex'
  ) {
    return OPENAI_CODEX_53_MODEL
  }

  if (lower === 'gpt-5.3-codex') {
    return OPENAI_CODEX_53_MODEL
  }

  return trimmed
}

export function isOpenAiModel(model: string | null | undefined) {
  const normalized = normalizeModelId(model)
  return typeof normalized === 'string' && normalized.toLowerCase().startsWith('openai/')
}

export function isLlamacppModel(model: string | null | undefined) {
  const normalized = normalizeModelId(model)
  return (
    typeof normalized === 'string' &&
    normalized.trim().toLowerCase().startsWith('llamacpp/')
  )
}

export { OPENAI_CODEX_53_MODEL }
