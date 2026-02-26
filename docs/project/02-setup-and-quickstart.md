# Setup And Quick Start

## Prerequisites

- Bun (the repo uses `bun` and includes `bun.lock`)
- Node-compatible environment (Bun runtime is used to run scripts)
- OpenCode server access (local or remote-backed via OpenCode)
- Optional: local `llama.cpp` server if you want offline/local model runs

## Install Dependencies

From repo root:

```bash
bun install
```

Common scripts from `package.json`:

- `bun run bench` - run benchmark CLI (`runner/index.ts`)
- `bun run bench:local` - benchmark CLI with `--debug --fail-fast`
- `bun run bench:ui` - local benchmark web UI
- `bun run lint` - lint repository

## Quick Start: OpenCode Server + Full Run

Start OpenCode server in one terminal:

```bash
opencode serve
```

Run a full benchmark in another terminal:

```bash
bun runner/index.ts \
  --model openai/gpt-5.3-codex \
  --solver-model openai/gpt-4.1-mini
```

Run a smaller subset:

```bash
bun runner/index.ts \
  --pattern "evals/animation/01*" \
  --model "openai/gpt-5.3-codex" \
  --solver-model "openai/gpt-5.3-codex"
```

## Quick Start: Local Web UI

Start the local UI:

```bash
bun run bench:ui
```

Open:

- `http://127.0.0.1:4173`

Change the UI port:

```bash
BENCH_UI_PORT=4174 bun run bench:ui
```

## Quick Start: Judge Existing Generated Outputs Only

If you already have generated outputs in `results/<run-id>/generated`, run judge-only:

```bash
bun runner/judge-existing-run.ts \
  --source-run results/<run-id> \
  --model "your/judge-model" \
  --pattern "evals/**/*"
```

This creates a new results folder with judge outputs only.

## Quick Start: Resume An Interrupted Judge-Only Run

If a judge-only run was interrupted, resume it in place:

```bash
bun runner/judge-existing-run.ts \
  --source-run results/<generated-source-run> \
  --resume-run results/<partial-judge-run> \
  --model "your/judge-model" \
  --pattern "evals/**/*"
```

The runner will:

- read existing `results/<partial-judge-run>/evals/*.json`
- skip already judged evals
- continue remaining evals
- recompute `summary.json` from persisted per-eval results

## Local `llama.cpp` / OpenCode Workflow (Common Pattern)

This repo can be used with a locally hosted `llama-server` via an OpenCode provider/model alias.

Typical flow:

1. Start `llama-server`.
2. Configure OpenCode provider/model alias to point at the local server.
3. Use the alias for both `--solver-model` and `--model`.

Example runner command (model alias is an example, depends on your OpenCode config):

```bash
bun runner/index.ts \
  --model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --solver-model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --pattern "evals/animation/*" \
  --concurrency 2
```

## Important Behavior Notes

### Why scores can be all zero

If you omit `--model` (judge model), the LLM judge is skipped and the run will report zero scores.

### Baseline behavior when solver model is omitted

If you omit `--solver-model`, the solver stage is skipped and the runner materializes reference files as the generated output.

## Recommended First Validation

Before a full 141+ eval run:

1. Run a 1-3 eval subset with a narrow pattern.
2. Confirm `summary.json` contains non-null `judgeModel` and `solverModel`.
3. Confirm progress/ETA output is stable.
4. Then increase pattern and concurrency.
