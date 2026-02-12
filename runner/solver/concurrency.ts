/*
  Executes async work with a fixed concurrency limit and stable result ordering.
 */
export async function runWithConcurrency<T, TResult>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<TResult>
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

      results[currentIndex] = await worker(items[currentIndex]!, currentIndex)
    }
  }

  const workers = Array.from(
    { length: Math.min(boundedLimit, items.length) },
    () => runWorker()
  )
  await Promise.all(workers)

  return results
}
