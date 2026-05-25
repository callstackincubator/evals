import { describe, expect, test } from 'bun:test'

import {
  configureOpencodeVerboseLogging,
  isOpencodeVerboseLoggingEnabled,
  startOpencodeCallTracer,
} from './opencode-trace'

describe('opencode trace logging', () => {
  test('verbose flag toggles tracer behavior', () => {
    configureOpencodeVerboseLogging({ verbose: false })
    const silentTracer = startOpencodeCallTracer({
      label: 'test',
      model: 'provider/model',
      port: 4096,
      timeoutMs: 1000,
    })

    expect(typeof silentTracer.setPhase).toBe('function')
    silentTracer.setPhase('noop')
    silentTracer.stop()

    configureOpencodeVerboseLogging({ verbose: true })
    expect(isOpencodeVerboseLoggingEnabled()).toBe(true)

    const verboseTracer = startOpencodeCallTracer({
      label: 'test',
      model: 'provider/model',
      port: 4096,
      timeoutMs: 1000,
    })
    verboseTracer.noteSessionId(undefined)
    verboseTracer.noteSessionId('session-123')
    verboseTracer.stop()

    configureOpencodeVerboseLogging({ verbose: false })
  })
})
