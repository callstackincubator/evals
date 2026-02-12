import { describe, expect, test } from 'bun:test'

import { runWithConcurrency } from '../utils'

describe('runWithConcurrency', () => {
  test('preserves result ordering while using parallel workers', async () => {
    const values = [1, 2, 3, 4, 5]

    const results = await runWithConcurrency(values, 2, async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 10 - value))
      return value * 10
    })

    expect(results).toEqual([10, 20, 30, 40, 50])
  })
})
