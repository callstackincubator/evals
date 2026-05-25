export const DEFAULT_OPENCODE_PORT = 4096

export const OPENCODE_CONTAINER_WORKSPACE = '/workspace'

export const OPENCODE_DOCKER_RUN_LABEL = 'evals.opencode.run-id'

export const DEFAULT_OPENCODE_DOCKER_PASSTHROUGH_ENV_PREFIXES = [
  'OPENCODE_',
  'OPENAI_',
  'ANTHROPIC_',
  'GOOGLE_',
  'GEMINI_',
  'AZURE_',
  'PARASAIL_',
  'AI_GATEWAY_',
  'CLOUDFLARE_',
] as const
