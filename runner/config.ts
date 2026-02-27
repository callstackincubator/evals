import { parseArgs as parseArgv } from 'node:util'

function parsePositiveInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${flagName} must be a positive integer`)
  }

  return parsedValue
}

function parseNonNegativeInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`${flagName} must be a non-negative integer`)
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
    maxRetries: parseNonNegativeInteger(values['max-retries'], '--max-retries'),
    model: values.model,
    pattern: values.pattern,
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
      'model': { type: 'string' },
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

  return {
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    debug: values.debug ?? false,
    failFast: values['fail-fast'] ?? false,
    model: values.model,
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: parsePort(values.port),
    input: values.input,
    output: values.output,
  }
}
