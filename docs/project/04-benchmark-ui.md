# Benchmark UI

The project includes a local web UI for running benchmarks and judge-only reruns.

## Start The UI

```bash
bun run bench:ui
```

Default URL:

- `http://127.0.0.1:4173`

Custom port:

```bash
BENCH_UI_PORT=4174 bun run bench:ui
```

## What The UI Controls

The UI launches the same CLI scripts used in terminal workflows:

- `runner/index.ts` for `Full` and `Generate Only`
- `runner/judge-existing-run.ts` for `Judge Only`

It also injects project-local XDG paths for OpenCode data/config/cache/state under `.opencode-home/`.

## Modes

### Full (Generate + Judge)

- requires `Generator Model`
- requires `Judge Model`
- runs solver and judge for selected pattern

### Generate Only

- requires `Generator Model`
- `Judge Model` is disabled
- writes generated outputs but skips LLM judging

### Judge Only (Select Source Run)

- requires `Judge Model`
- `Generator Model` is disabled
- reuses generated outputs from a selected `results/<run>` source
- can optionally resume a prior judge-only output run

## Field Reference

### Generator Model

Maps to CLI flag:

- `--solver-model`

This is the model used to generate code.

### Judge Model

Maps to CLI flag:

- `--model`

This is the model used to evaluate generated code.

### Pattern

Glob filter for eval selection (same behavior as CLI `--pattern`).

Examples:

- `evals/**/*`
- `evals/animation/*`
- `evals/animation/01*`

Judge-only note:

- The selected source run must contain matching generated directories for the chosen pattern.

### Concurrency

Number of evals processed in parallel.

Higher values increase throughput but also increase:

- CPU load
- RAM usage
- VRAM pressure
- timeout risk / instability for local model servers

Recommended starting points for local models:

- `1-2` for initial validation
- then increase gradually after confirming stability

### Timeout (ms)

Per-request timeout for solver/judge model calls.

Increase this for:

- local models
- larger patterns
- higher concurrency

### OpenCode Port

Port used by the OpenCode server connection.

UI behavior:

- if the requested port is busy, the UI auto-selects the next available port
- the selected port is logged in the live logs panel

## Judge-Only Source And Resume Selectors

### Judge Source Run (generated files)

Select the results run whose `generated/` directory contains the files you want to judge.

Option labels include:

- generated eval count
- solver model
- original pattern

### Resume Judge Output Run (optional)

Select an existing results run with saved judge per-eval JSON files to continue.

If selected, the UI passes `--resume-run` and the judge-only runner will:

- skip already judged evals
- continue pending evals
- recompute summary

Leave it on `Create new run (no resume)` to start a fresh judge-only run.

## Judge-Only Readiness Preview

The UI computes a live preview for the selected source run + pattern:

- `Source Generated` - total eval directories under `results/<source-run>/generated`
- `Pattern Evals` - evals discovered by the current pattern
- `Ready to Judge` - pattern evals with matching generated outputs
- `Missing Generated` - pattern evals without generated outputs

This helps avoid `no generated files found` errors.

## Progress And Logs

### Progress panel (visible summary)

Shows:

- `X/Y` completed
- percent
- ETA
- elapsed time
- throughput (`ms/it`, `it/s`)
- last eval ID
- `llm:<score>` or `ERROR` when present

Before the first completion, ETA is not available yet.

### Live logs panel

Shows raw stdout/stderr from the spawned CLI process, including:

- command line used
- port auto-selection message (if any)
- source/resume run info for judge-only mode
- tqdm-style progress lines
- stack traces/errors

## Local API Endpoints (for debugging)

The UI server exposes a simple local JSON API:

- `GET /api/state`
- `GET /api/judge-source-preview?sourceRun=...&pattern=...`
- `POST /api/run`
- `POST /api/stop`

These endpoints are meant for the local UI and are not an authenticated multi-user service.

## Example UI Workflow: Judge-Only Rejudge With Resume

1. Start UI.
2. Choose `Judge Only (Select Source Run)`.
3. Select `Judge Source Run` (generated outputs).
4. Select `Resume Judge Output Run` (optional partial run).
5. Set `Pattern`.
6. Set `Judge Model`.
7. Set `Concurrency`, `Timeout`, and `OpenCode Port`.
8. Click `Run`.
9. Watch readiness preview, progress panel, and logs.
