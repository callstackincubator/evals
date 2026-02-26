# Results Format And Resume Behavior

## Results Directory Layout

Every run writes to:

- `results/<run-id>/`

Typical contents for a full run:

- `results/<run-id>/summary.json`
- `results/<run-id>/evals/*.json`
- `results/<run-id>/generated/<eval-id>/*`
- `results/<run-id>/debug/...` (only when `--debug`)

Judge-only runs write:

- `results/<run-id>/summary.json`
- `results/<run-id>/evals/*.json`

Judge-only runs read generated outputs from:

- `results/<source-run>/generated/<eval-id>/`

## `summary.json` (Full Run)

Produced by `runner/index.ts`.

Common fields:

- `runId`
- `startedAt`
- `finishedAt`
- `judgeModel`
- `solverModel`
- `pattern`
- `evalCount`
- `evalsProcessed`
- `evalsErrored`
- `requirementsTotal`
- `requirementsPassed`
- `weightedAverageScore`

Notes:

- `judgeModel` may be `null` if no `--model` is supplied.
- `weightedAverageScore` is `0` if no successful judged evals are present.

## Per-Eval Result JSON (Full Run)

Files live under:

- `results/<run-id>/evals/<eval-id>.json`

Common fields:

- `evalId`
- `evalPath`
- `judgeModel`
- `solverModel`
- `llmJudgeRequirements` (array of requirement verdicts)
- `score` (`passedWeight`, `totalWeight`, `ratio`)
- `outputFiles` (generated file paths)

## `summary.json` (Judge-Only Run)

Produced by `runner/judge-existing-run.ts`.

Includes full-run-like metrics plus source-run metadata:

- `sourceRun`
- `sourceRunId`
- `sourceJudgeModel`
- `sourceSolverModel`

When resumed (`--resume-run`), additional fields are written:

- `resumed` (`true`)
- `resumeRun`
- `resumeSkippedEvals` (already judged for current pattern)
- `resumeAttemptErrors` (errors encountered in the current resume invocation)

## Per-Eval Result JSON (Judge-Only Run)

Judge-only per-eval results include:

- all core judge fields (`evalId`, `evalPath`, `llmJudgeRequirements`, `score`, ...)
- `sourceGeneratedDir` (path to the reused generated files)

`sourceGeneratedDir` is also used as a compatibility signal for resume validation.

## Judge-Only Resume (`--resume-run`)

### What It Reuses

The resume runner reuses:

- existing `results/<resume-run>/evals/*.json`
- existing `results/<resume-run>/summary.json` metadata (when present)

### What It Recomputes

At the end of the resumed run, it recomputes aggregate metrics from persisted per-eval files for the selected pattern:

- `evalsProcessed`
- `evalsErrored`
- `requirementsTotal`
- `requirementsPassed`
- `weightedAverageScore`

This means summary metrics reflect the final persisted state, not only the latest process attempt.

### Resume Compatibility Checks

The runner rejects obvious mismatches:

- `sourceRun` differs from the resume run summary
- `judgeModel` differs from the resume run summary
- `pattern` differs from the resume run summary
- saved eval files do not look like judge-only outputs

## Pattern-Scoped Metrics In Resume

Resume is pattern-aware.

If you resume with a narrower pattern:

- skip counts and metrics are computed only for evals matching that pattern
- unrelated saved evals in the same resume folder are ignored for the current run summary

## Debug Artifacts

When `runner/index.ts` is executed with `--debug`, it writes per-eval judge debug output:

- `results/<run-id>/debug/<eval-id>/judge-prompt.txt`
- `results/<run-id>/debug/<eval-id>/judge-output.json`

This is useful for:

- auditing judge prompts
- inspecting malformed judge responses
- debugging scoring disputes

## Interpreting `evalsProcessed` vs. `evalsErrored`

- `evalCount`: total discovered evals for the selected pattern
- `evalsProcessed`: evals with successful judge result payloads
- `evalsErrored`: evals that failed during solver/judge processing (or remained unjudged in resume scope)

When `--fail-fast` is not used, the process can still complete and write a summary even with many errors.
