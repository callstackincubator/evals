import { parseArgs as parseArgv } from 'node:util'

function normalizeSkipEvalIds(value: string | string[] | undefined) {
  if (!value) {
    return []
  }

  return (Array.isArray(value) ? value : [value]).filter(
    (item) => item.length > 0
  )
}

function parsePositiveInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${flagName} must be a positive integer`)
  }

  return parsedValue
}

function parsePort(rawValue: string | undefined) {
  return rawValue ? parsePositiveInteger(rawValue, '--port') : undefined
}

/*
  Parses CLI flags for the standalone generation command.
*/
export function parseRunCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'concurrency': { type: 'string', default: '4' },
      'fail-fast': { type: 'boolean', default: false },
      'max-retries': { type: 'string', default: '1' },
      'model': { type: 'string' },
      'pattern': { type: 'string', default: 'evals/**/*' },
      'skip-eval-id': { type: 'string', multiple: true },
      'timeout': { type: 'string', default: '120000' },
      'port': { type: 'string' },
      'output': { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  })

  if (!values.model) {
    throw new Error('--model is required for generation runs')
  }

  return {
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    failFast: values['fail-fast'] ?? false,
    maxRetries: parsePositiveInteger(values['max-retries'], '--max-retries'),
    model: values.model,
    pattern: values.pattern,
    skipEvalIds: normalizeSkipEvalIds(values['skip-eval-id']),
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: parsePort(values.port),
    output: values.output,
  }
}

/*
  Parses CLI flags for the standalone LLM judge command.
*/
export function parseJudgeCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'concurrency': { type: 'string', default: '4' },
      'debug': { type: 'boolean', default: false },
      'fail-fast': { type: 'boolean', default: false },
      'max-retries': { type: 'string', default: '1' },
      'model': { type: 'string' },
      'rerun-missing-judgements': { type: 'boolean', default: false },
      'rerun-requirement-id': { type: 'string' },
      'rerun-requirements-file': { type: 'string' },
      'skip-eval-id': { type: 'string', multiple: true },
      'timeout': { type: 'string', default: '120000' },
      'port': { type: 'string' },
      'input': { type: 'string' },
      'output': { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  })

  if (!values.input) {
    throw new Error('--input is required for judge runs')
  }
  if (!values.model) {
    throw new Error('--model is required for judge runs')
  }
  if (values['rerun-requirement-id'] && !values['rerun-requirements-file']) {
    throw new Error(
      '--rerun-requirements-file is required when --rerun-requirement-id is provided'
    )
  }
  if (values['rerun-missing-judgements'] && values['rerun-requirements-file']) {
    throw new Error(
      '--rerun-missing-judgements cannot be used together with --rerun-requirements-file'
    )
  }
  if (values['rerun-missing-judgements'] && !values.output) {
    throw new Error(
      '--output is required when rerunning missing judgements over existing judge outputs'
    )
  }
  if (values['rerun-requirements-file'] && !values.output) {
    throw new Error(
      '--output is required when rerunning requirements over existing judge outputs'
    )
  }

  return {
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    debug: values.debug ?? false,
    failFast: values['fail-fast'] ?? false,
    maxRetries: parsePositiveInteger(values['max-retries'], '--max-retries'),
    model: values.model,
    skipEvalIds: normalizeSkipEvalIds(values['skip-eval-id']),
    rerunMissingJudgements: values['rerun-missing-judgements'] ?? false,
    rerunRequirementId: values['rerun-requirement-id'],
    rerunRequirementsFile: values['rerun-requirements-file'],
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: parsePort(values.port),
    input: values.input,
    output: values.output,
  }
}
