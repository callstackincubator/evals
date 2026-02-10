import { parseArgs as parseArgv } from 'node:util'

/*
  Parses CLI flags and returns normalized runner settings.
 */
export function parseCliArgs(argv: string[] = Bun.argv.slice(2)) {
  const { values } = parseArgv({
    args: argv,
    options: {
      'limit-concurrency': { type: 'string', default: '4' },
      debug: { type: 'boolean', default: false },
      model: { type: 'string', default: 'openai/gpt-5.3-codex' },
      pattern: { type: 'string', default: '**/requirements.yaml' },
      timeout: { type: 'string', default: '120000' },
      port: { type: 'string', default: '4096' },
    },
    strict: true,
    allowPositionals: false,
  })

  return {
    concurrency: parseInt(values['limit-concurrency']),
    debug: values.debug ?? false,
    model: values.model,
    pattern: values.pattern,
    timeout: parseInt(values.timeout),
    port: parseInt(values.port),
  }
}
