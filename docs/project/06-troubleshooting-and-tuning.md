# Troubleshooting And Performance Tuning

## Common Failures

## "All scores are 0"

Most common cause:

- judge model was not provided (`--model` missing)

Symptoms:

- `summary.json` has `"judgeModel": null`
- `weightedAverageScore` is `0`
- run logs show no LLM judge scoring

Fix:

- rerun with `--model <judge-model>`

## "no generated files found" in judge-only mode

Cause:

- selected `--pattern` includes evals that do not exist in `results/<source-run>/generated/`

Example mismatch:

- source run only generated `evals/animation/01*`
- judge-only pattern is `evals/animation/*`

Fix:

- choose a source run with matching generated outputs
- or narrow the pattern to what the source run contains
- use the UI `Judge-Only Readiness` preview before starting

## OpenCode server failed to start on port

Typical error:

- `Failed to start server on port <n>`

Cause:

- port conflict (another OpenCode server/process already bound)

Fix:

- choose a different `--port`
- stop the stale process using that port
- use the UI, which auto-picks the next free port if the requested port is busy

## Process exited with code 0 but many evals failed

This is expected when `--fail-fast` is not set.

Behavior:

- per-eval errors are logged and counted
- runner continues processing remaining evals
- final process can still exit `0`

Always inspect:

- log errors
- `summary.json` (`evalsErrored`)

## YAML parse errors in `requirements.yaml`

Problem pattern:

- unquoted `description:` values containing `:` or `!!...`

Example:

- `description: Must gate ... enabled: !!profileId ...`

Current loader behavior:

- the requirements loader normalizes unsafe unquoted `description:` lines before YAML parsing

If you still see YAML parse errors:

- confirm you are running a branch that includes the loader fix
- inspect the exact `requirements.yaml`
- quote complex `description:` values explicitly as a long-term authoring best practice

## Judge-only resume rejects `--resume-run`

Possible causes:

- different `--source-run`
- different `--model`
- different `--pattern`
- selected resume folder is not a judge-only output run

Fix:

- use the same `source-run`, `model`, and `pattern` as the interrupted run
- pick a judge-only results folder (not a full run)

## Timeouts on local models

Common causes:

- concurrency too high
- model server parallelism too low
- timeout too low for local inference latency

Fixes:

- reduce runner `--concurrency`
- increase `--timeout` (for example `300000` or `600000`)
- tune `llama-server --parallel`

## Performance Tuning (Local `llama.cpp`)

## Key Rule

Runner concurrency should usually be less than or equal to effective model-server parallelism.

If `llama-server` is running with low/default parallelism, high runner concurrency mostly creates queueing and timeouts.

## Practical Starting Points

These are starting points, not guarantees:

- Judge-only runs: `--concurrency 6-8`
- Generate-only runs: `--concurrency 4-6`
- Full runs: `--concurrency 2-4`

Then tune based on:

- throughput (`it/s`)
- timeout rate
- VRAM usage
- overall stability

## Validate With A Small Pattern First

Test a small, repeatable subset before scaling:

```bash
bun runner/judge-existing-run.ts \
  --source-run results/<run-id> \
  --pattern "evals/animation/01*" \
  --model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --concurrency 2 \
  --timeout 300000
```

Increase concurrency gradually (for example `2 -> 4 -> 8`) and watch:

- ETA trend
- actual throughput
- errors/timeouts

## Example `llama-server` Starting Configuration (Throughput-Oriented Baseline)

Example only; flags vary by `llama.cpp` build version:

```bash
./llama-server \
  -hf unsloth/GLM-4.7-Flash-GGUF:Q4_K_M \
  --host 0.0.0.0 \
  --port 8080 \
  --parallel 8 \
  -ngl 999 \
  -c 16384 \
  -fa \
  -b 2048 \
  -ub 512 \
  -t 20 \
  -tb 20
```

If your build differs, inspect supported flags:

```bash
./llama-server --help
```

## Progress / ETA Interpretation

Progress output is helpful but can mislead in some cases:

- Early run: ETA is noisy until a few evals complete.
- Fast failures (port errors, missing files): ETA may look unrealistically short because items fail instantly.
- Resume runs: progress starts at the already-completed count; rate reflects newly processed evals in the current process.

## Recommended Operational Workflow

1. Validate on a 1-3 eval pattern.
2. Confirm ports and models are correct.
3. Increase timeout for local models.
4. Increase concurrency gradually.
5. For judge experiments, reuse `generated/` via judge-only mode.
6. If interrupted, resume with `--resume-run`.
