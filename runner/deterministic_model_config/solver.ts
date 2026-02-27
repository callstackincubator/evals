/*
  Deterministic configuration for the local LLM solver (generation) model.

  These settings are tuned to produce consistent, reproducible outputs
  when running evals against a locally-hosted llamacpp model.
*/

export const SOLVER_SYSTEM_PROMPT = `
  You are a React Native developer.
  Your goal is to modify provided files to satisfy given task.
  You must return all given files with applied modification.
`

export const SOLVER_JSON_FALLBACK_SYSTEM_PROMPT = `
  Return only valid JSON matching this shape:
  {
    "summary": "short summary",
    "files": [{ "path": "relative/path.ext", "content": "full file contents" }]
  }
  Do not include markdown fences or any extra text.
`

export const SOLVER_OPENCODE_SYSTEM_PROMPT =
  'You are a concise code generator. Do not use tools. Return only the requested result.'

/* Generation parameters */
export const SOLVER_TEMPERATURE = 0
export const SOLVER_STREAM = false

/* Token limits */
export const SOLVER_DEFAULT_MAX_TOKENS = 4096
export const SOLVER_MAX_TOKENS_CAP = 32768

/* Retry / fallback strategy */
export const SOLVER_STRUCTURED_OUTPUT_ATTEMPTS = 2
export const SOLVER_JSON_FALLBACK_ATTEMPTS = 2

/* llamacpp-specific retry strategy */
export const SOLVER_LLAMACPP_JSON_FALLBACK_ATTEMPTS = 3
export const SOLVER_LLAMACPP_MAX_ATTEMPTS = 8

/* llamacpp server defaults */
export const SOLVER_LLAMACPP_DEFAULT_BASE_URL = 'http://127.0.0.1:8080/v1'
export const SOLVER_LLAMACPP_DISABLE_THINKING = true
