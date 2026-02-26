type BaseEvalRun = {
  kind: 'success' | 'error'
  index: number
}

function isErrorRun<TRun extends BaseEvalRun>(
  run: TRun
): run is Extract<TRun, { kind: 'error' }> {
  return run.kind === 'error'
}

function isSuccessRun<TRun extends BaseEvalRun>(
  run: TRun
): run is Extract<TRun, { kind: 'success' }> {
  return run.kind === 'success'
}

/*
  Partitions eval runs by status and returns successful runs sorted by original order.
*/
export function partitionEvalRuns<TRun extends BaseEvalRun>(runs: TRun[]) {
  const successfulRuns: Extract<TRun, { kind: 'success' }>[] = []
  const errorRuns: Extract<TRun, { kind: 'error' }>[] = []

  for (const run of runs) {
    if (isErrorRun(run)) {
      errorRuns.push(run)
      continue
    }

    if (isSuccessRun(run)) {
      successfulRuns.push(run)
    }
  }

  successfulRuns.sort((left, right) => left.index - right.index)

  return {
    successfulRuns,
    errorRuns,
  }
}
