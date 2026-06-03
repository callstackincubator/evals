import { describe, expect, test } from 'bun:test'

import { computeScore, type RequirementResult } from '../utils'

function makeRequirementResult(overrides: Partial<RequirementResult>) {
  const passed = overrides.passed ?? false
  return {
    id: 'req',
    description: 'Requirement',
    weight: 1,
    score: passed ? 1 : 0,
    passed,
    reason: 'reason',
    evidence: [],
    ...overrides,
  }
}

describe('computeScore', () => {
  test('handles unweighted and weighted requirement sets', () => {
    const score = computeScore([
      makeRequirementResult({ id: 'a', weight: 1, score: 1, passed: true }),
      makeRequirementResult({ id: 'b', weight: 3, score: 0, passed: false }),
    ])

    expect(score.totalWeight).toBe(4)
    expect(score.passedWeight).toBe(1)
    expect(score.ratio).toBe(0.25)
  })

  test('normalizes invalid weights to default weight 1', () => {
    const score = computeScore([
      makeRequirementResult({ id: 'a', weight: 0, score: 1, passed: true }),
      makeRequirementResult({
        id: 'b',
        weight: Number.NaN,
        score: 0,
        passed: false,
      }),
    ])

    expect(score.totalWeight).toBe(2)
    expect(score.passedWeight).toBe(1)
    expect(score.ratio).toBe(0.5)
  })

  test('awards graded partial credit per requirement', () => {
    const score = computeScore([
      makeRequirementResult({ id: 'a', weight: 1, score: 1, passed: true }),
      makeRequirementResult({ id: 'b', weight: 1, score: 0.75, passed: true }),
      makeRequirementResult({ id: 'c', weight: 2, score: 0.5, passed: true }),
    ])

    // (1*1 + 0.75*1 + 0.5*2) / 4 = 2.75 / 4
    expect(score.totalWeight).toBe(4)
    expect(score.passedWeight).toBe(2.75)
    expect(score.ratio).toBe(0.6875)
  })

  test('clamps out-of-range scores and falls back to passed flag', () => {
    const score = computeScore([
      makeRequirementResult({ id: 'a', weight: 1, score: 1.5, passed: true }),
      makeRequirementResult({
        id: 'b',
        weight: 1,
        score: undefined as unknown as number,
        passed: true,
      }),
    ])

    expect(score.passedWeight).toBe(2)
    expect(score.ratio).toBe(1)
  })
})
