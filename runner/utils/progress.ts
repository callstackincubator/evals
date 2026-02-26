function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}`
  }

  return `${minutes}:${pad2(seconds)}`
}

function renderBar(completed: number, total: number, width = 20) {
  if (total <= 0) {
    return `[${'-'.repeat(width)}]`
  }

  const ratio = Math.max(0, Math.min(1, completed / total))
  const filled = Math.round(ratio * width)
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}]`
}

type TickInput = {
  evalId: string
  scoreRatio?: number
  error?: boolean
}

type ProgressReporterOptions = {
  initialCompleted?: number
}

/*
  Prints a tqdm-like progress line with elapsed time and ETA.
*/
export function createProgressReporter(
  total: number,
  options: ProgressReporterOptions = {}
) {
  const startedAtMs = Date.now()
  const initialCompleted = Math.max(
    0,
    Math.min(total, Math.floor(options.initialCompleted ?? 0))
  )
  let completedThisRun = 0

  return {
    tick(input: TickInput) {
      completedThisRun += 1

      const completed = Math.min(total, initialCompleted + completedThisRun)

      const elapsedMs = Date.now() - startedAtMs
      const averageMsPerItem =
        completedThisRun > 0 ? elapsedMs / completedThisRun : 0
      const remainingItems = Math.max(0, total - completed)
      const etaMs = averageMsPerItem * remainingItems
      const percent = total > 0 ? (completed / total) * 100 : 100
      const ratePerSecond =
        elapsedMs > 0 ? completedThisRun / (elapsedMs / 1000) : 0

      const scorePart =
        typeof input.scoreRatio === 'number' ? ` | llm:${input.scoreRatio}` : ''
      const statusPart = input.error ? ' | ERROR' : ''

      console.log(
        `${renderBar(completed, total)} ${completed}/${total} ` +
          `(${percent.toFixed(1)}%) | elapsed ${formatDuration(elapsedMs)} ` +
          `| eta ${formatDuration(etaMs)} | ${averageMsPerItem < 1000 ? Math.round(averageMsPerItem) + 'ms/it' : (averageMsPerItem / 1000).toFixed(1) + 's/it'} ` +
          `| ${ratePerSecond.toFixed(2)} it/s${scorePart}${statusPart} | ${input.evalId}`
      )
    },
  }
}
