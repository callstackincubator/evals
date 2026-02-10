import { describe, expect, test } from 'bun:test'

import { computeScore, type RequirementResult } from '../utils'

function makeRequirementResult(
  overrides: Partial<RequirementResult>,
) {
  return {
    id: 'req',
    description: 'Requirement',
    weight: 1,
    passed: false,
    reason: 'reason',
    evidence: [],
    ...overrides,
  }
}

describe('computeScore', () => {
  test('handles unweighted and weighted requirement sets', () => {
    const score = computeScore([
      makeRequirementResult({ id: 'a', weight: 1, passed: true }),
      makeRequirementResult({ id: 'b', weight: 3, passed: false }),
    ])

    expect(score.totalWeight).toBe(4)
    expect(score.passedWeight).toBe(1)
    expect(score.ratio).toBe(0.25)
  })

  test('normalizes invalid weights to default weight 1', () => {
    const score = computeScore([
      makeRequirementResult({ id: 'a', weight: 0, passed: true }),
      makeRequirementResult({ id: 'b', weight: Number.NaN, passed: false }),
    ])

    expect(score.totalWeight).toBe(2)
    expect(score.passedWeight).toBe(1)
    expect(score.ratio).toBe(0.5)
  })
})
