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

/*
  Executes async work with a fixed concurrency limit and stable result ordering.
 */
export async function runWithConcurrency<T, TResult>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<TResult>,
) {
  const boundedLimit = Math.max(1, Math.floor(limit))

  const results = new Array<TResult>(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (true) {
      const currentIndex = nextIndex
      nextIndex += 1

      if (currentIndex >= items.length) {
        return
      }

      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  }

  const workers = Array.from({ length: Math.min(boundedLimit, items.length) }, () => runWorker())
  await Promise.all(workers)

  return results
}
