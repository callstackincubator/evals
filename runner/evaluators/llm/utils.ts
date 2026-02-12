export type RequirementResult = {
  id: string
  description: string
  weight: number
  passed: boolean
  reason: string
  evidence: string[]
  confidence?: number
}

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
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
 */
export function computeScore(requirementResults: RequirementResult[]) {
  const totalWeight = requirementResults.reduce((accumulator, current) => {
    return accumulator + normalizeWeight(current.weight)
  }, 0)

  const passedWeight = requirementResults.reduce((accumulator, current) => {
    if (!current.passed) {
      return accumulator
    }

    return accumulator + normalizeWeight(current.weight)
  }, 0)

  const ratio = totalWeight === 0 ? 0 : passedWeight / totalWeight

  return {
    passedWeight: roundTo(passedWeight, 4),
    totalWeight: roundTo(totalWeight, 4),
    ratio: roundTo(ratio, 4),
  }
}
