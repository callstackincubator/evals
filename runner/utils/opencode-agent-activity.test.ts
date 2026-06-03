import { describe, expect, test } from 'bun:test'
import type { Event } from '@opencode-ai/sdk'

import { formatAgentEvent } from './opencode-agent-activity'

describe('formatAgentEvent', () => {
  test('formats tool completion events', () => {
    const event = {
      type: 'message.part.updated',
      properties: {
        part: {
          id: 'part-1',
          sessionID: 'session-1',
          messageID: 'message-1',
          type: 'tool',
          callID: 'call-1',
          tool: 'bash',
          state: {
            status: 'completed',
            input: { command: 'ls' },
            output: 'App.tsx',
            title: 'List workspace files',
            metadata: {},
            time: {
              start: 1,
              end: 2,
            },
          },
        },
      },
    } satisfies Event

    expect(formatAgentEvent(event)).toContain('tool bash completed')
    expect(formatAgentEvent(event)).toContain('List workspace files')
  })

  test('formats session status events', () => {
    const event = {
      type: 'session.status',
      properties: {
        sessionID: 'session-1',
        status: {
          type: 'busy',
        },
      },
    } satisfies Event

    expect(formatAgentEvent(event)).toBe('session session-1 busy')
  })

  test('ignores low-signal events', () => {
    const event = {
      type: 'server.connected',
      properties: {},
    } satisfies Event

    expect(formatAgentEvent(event)).toBeUndefined()
  })
})
