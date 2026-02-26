# Benchmarking selected models

This guide describes how to run reproducible model comparisons with the runner.

## Core comparison rules

- Keep dataset constant (`--pattern`, same commit hash).
- Keep judge model constant when comparing solver models.
- Keep solver model constant when comparing judge models.
- Run repeats for each configuration to reduce single-run noise.

## Compare solver models (recommended primary experiment)

Use one fixed judge model and vary solver model.

```bash
PATTERN="evals/**"
JUDGE_MODEL="<judge-model>"

for SOLVER_MODEL in "<solver-a>" "<solver-b>" "<solver-c>"; do
  bun runner/index.ts \
    --pattern "$PATTERN" \
    --solver-model "$SOLVER_MODEL" \
    --model "$JUDGE_MODEL" \
    --concurrency 4 \
    --timeout 120000
done
```

Repeat each solver run multiple times (for example, 3 runs per solver) and aggregate results offline.

## Compare judge models (secondary experiment)

Use one fixed solver model and vary judge model.

```bash
PATTERN="evals/**"
SOLVER_MODEL="<solver-model>"

for JUDGE_MODEL in "<judge-a>" "<judge-b>"; do
  bun runner/index.ts \
    --pattern "$PATTERN" \
    --solver-model "$SOLVER_MODEL" \
    --model "$JUDGE_MODEL" \
    --concurrency 4 \
    --timeout 120000
done
```

## Oracle/reference baseline run

To validate judge behavior independent of solver quality, omit `--solver-model`:

```bash
bun runner/index.ts --pattern "evals/**" --model "<judge-model>"
```

The runner will evaluate `reference/` files as generated output.

## What to report for each run

From `results/<run-id>/summary.json`:

- `runId`
- `judgeModel`
- `solverModel`
- `pattern`
- `evalCount`, `evalsProcessed`, `evalsErrored`
- `requirementsTotal`, `requirementsPassed`
- `weightedAverageScore`

Also record:

- Repository commit hash.
- Execution timestamp.
- CLI options (`--pattern`, `--solver-model`, `--model`, `--timeout`, `--concurrency`).

## Interpreting `weightedAverageScore`

- Each eval score is weighted by requirement weights within that eval.
- The run-level `weightedAverageScore` is an unweighted mean across successfully processed evals.
- Errored evals are excluded from that mean and counted separately in `evalsErrored`.

## Reproducibility notes

- The runner does not pin random seed/decoding settings in solver or judge calls.
- Model/provider nondeterminism can change outcomes across runs.
- Prefer repeated runs and report mean/variance, not a single run.
