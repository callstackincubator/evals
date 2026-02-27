/*
  Deterministic configuration for the LLM judge model.

  These settings are tuned to produce consistent, reproducible verdicts
  when evaluating generated code against declared requirements.
*/

export const JUDGE_JSON_FALLBACK_SYSTEM_PROMPT = `
  Return only valid JSON matching this shape:
  {
    "summary": "optional short summary",
    "requirements": [
      {
        "id": "requirement-id",
        "passed": true,
        "reason": "concise reason",
        "evidence": ["file:line evidence"],
        "confidence": 0.95
      }
    ]
  }
  Do not include markdown fences or extra text.
`

export const JUDGE_OPENCODE_SYSTEM_PROMPT =
  'You are a concise code evaluator. Do not use tools. Return the requested result only.'

/* OpenCode provider model settings */
export const JUDGE_OPENCODE_MODEL_SETTINGS = {
  createNewSession: true,
  agent: 'general',
  systemPrompt: JUDGE_OPENCODE_SYSTEM_PROMPT,
} as const

/* Retry / fallback strategy */
export const JUDGE_STRUCTURED_OUTPUT_ATTEMPTS = 3
export const JUDGE_JSON_FALLBACK_ATTEMPTS = 3
