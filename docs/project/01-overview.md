# Project Overview

## What This Repository Is

`react-native-evals` is a benchmark suite for measuring how coding models solve realistic React Native tasks.

Each benchmark task ("eval") provides:

- a starter implementation (`app/`)
- a natural-language task prompt (`prompt.md`)
- a target/reference implementation (`reference/`)
- file-verifiable requirements (`requirements.yaml`)

The runner can:

- generate a solution using a solver model
- judge the generated solution with a judge model
- compute a weighted requirement score
- write machine-readable results to `results/<run-id>/`

## Core Concepts

### Eval

An eval is one task directory under `evals/<category>/<eval-id>/` containing:

- `prompt.md`
- `requirements.yaml`
- `app/`
- `reference/`

### Solver model vs. Judge model

- Solver model (`--solver-model`): generates/edits files to solve the task
- Judge model (`--model`): evaluates generated files against requirements

They can be the same model or different models.

### Run types

- Full run: solver + judge
- Generate-only run: solver only (judge skipped)
- Judge-only run from existing outputs: reuse `results/<run>/generated` and run only the judge

## How A Full Run Works

For each discovered eval:

1. Load baseline app files, reference files, prompt, and requirements.
2. Run solver stage (or copy reference files if no solver model is provided).
3. Run LLM judge stage (if judge model is provided).
4. Save per-eval result JSON.
5. Aggregate scores into `summary.json`.

## Repository Layout (Operational View)

Important top-level paths:

- `evals/` - benchmark tasks grouped by category
- `runner/` - CLI runners, solver/judge pipeline, local UI, utilities
- `results/` - benchmark outputs (`generated`, `evals`, `summary.json`)
- `docs/` - repository docs (including this `docs/project/` set)
- `paper/` - benchmark methodology whitepaper sources/pdf
- `testbench/` - RN harness placeholder (not wired into active runner pipeline)
- `src/` - sample/support code not used by the main runner pipeline
- `runs/` - local helper PID/log artifacts (used by ad hoc scripts/workflows)

## Main Runtime Components

### `runner/index.ts`

Primary benchmark CLI:

- discovers evals by glob pattern
- runs solver and judge with bounded concurrency
- writes `results/<timestamp>/...`
- prints tqdm-style progress with ETA

### `runner/judge-existing-run.ts`

Judge-only CLI:

- reads generated files from an existing results run
- runs only the LLM judge
- supports resuming partial judge-only runs (`--resume-run`)

### `runner/ui.ts`

Local web UI:

- run control for full/generate-only/judge-only modes
- source-run and resume-run selectors for judge-only mode
- readiness preview (how many evals are judgeable for current pattern)
- live logs and progress/ETA panel

### `runner/utils/opencode.ts`

Ensures a reusable OpenCode server process is started once per Node/Bun process and reused across solver/judge calls.

## Discovery and Scoring Basics

- Evals are discovered by scanning for `requirements.yaml` under the selected pattern.
- Progress ordering is stable by discovered eval ordering (sorted by eval ID).
- Final score is a weighted average of requirement pass ratios across successfully processed evals.
- Errors are counted separately and do not stop the run unless `--fail-fast` is enabled.
