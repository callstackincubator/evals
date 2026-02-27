import { parseArgs as parseArgv } from 'node:util'

import { normalizeModelId } from './utils/model'

function parsePositiveInteger(rawValue: string, flagName: string) {
  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${flagName} must be a positive integer`)
  }

  return parsedValue
}

/*
  Parses CLI flags and returns normalized runner settings.
*/
export function parseCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'concurrency': { type: 'string', default: '4' },
      'debug': { type: 'boolean', default: false },
      'fail-fast': { type: 'boolean', default: false },
      'model': { type: 'string' },
      'solver-model': { type: 'string' },
      'pattern': { type: 'string', default: 'evals/**/*' },
      'timeout': { type: 'string', default: '120000' },
      'port': { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  })

  return {
    concurrency: parsePositiveInteger(values.concurrency, '--concurrency'),
    debug: values.debug ?? false,
    failFast: values['fail-fast'] ?? false,
    model: normalizeModelId(values.model),
    solverModel: normalizeModelId(values['solver-model']),
    pattern: values.pattern,
    timeout: parsePositiveInteger(values.timeout, '--timeout'),
    port: values.port ? parsePositiveInteger(values.port, '--port') : undefined,
  }
}

export type CliOptions = ReturnType<typeof parseCliArgs>
