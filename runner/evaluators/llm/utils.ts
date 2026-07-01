export type RequirementResult = {
  id: string
  description: string
  weight: number
  // Graded partial-credit score in [0, 1]. `passed` is kept as a derived
  // boolean (score >= PASS_THRESHOLD) for back-compatible reporting.
  score: number
  passed: boolean
  reason: string
  evidence: string[]
  confidence?: number
}

export const PASS_THRESHOLD = 0.5

// Judge methodology version. v2 introduces graded partial-credit scoring,
// intent-based judging that credits valid idiomatic alternatives, an idiomatic
// code-quality dimension, and file-path-aware judge prompts. v2 scores are NOT
// comparable to v1 (binary pass/fail) — leaderboards must be re-judged.
export const JUDGE_METHODOLOGY_VERSION = 2

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

/*
  Clamps a requirement score into the [0, 1] partial-credit range. Falls back to
  the binary `passed` flag when a graded score is absent (older judge outputs).
 */
export function normalizeScore(
  score: number | undefined,
  passed: boolean | undefined
) {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return Math.min(1, Math.max(0, score))
  }

  return passed ? 1 : 0
}

/*
  Normalizes requirement weight to a positive numeric value.
 */
export function normalizeWeight(weight: number | undefined) {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) {
    return 1
  }

  return weight
}

/*
  Computes weighted score for one eval based on requirement results.

  Uses graded per-requirement scores (partial credit) so functionally correct,
  idiomatic implementations earn proportional credit instead of a binary pass.
 */
export function computeScore(requirementResults: RequirementResult[]) {
  const totalWeight = requirementResults.reduce((accumulator, current) => {
    return accumulator + normalizeWeight(current.weight)
  }, 0)

  const passedWeight = requirementResults.reduce((accumulator, current) => {
    const score = normalizeScore(current.score, current.passed)
    return accumulator + score * normalizeWeight(current.weight)
  }, 0)

  const ratio = totalWeight === 0 ? 0 : passedWeight / totalWeight

  return {
    passedWeight: roundTo(passedWeight, 4),
    totalWeight: roundTo(totalWeight, 4),
    ratio: roundTo(ratio, 4),
  }
}
