# Runner CLI Reference

This document covers:

- `runner/index.ts` (full benchmark runner)
- `runner/judge-existing-run.ts` (judge-only runner)

## `runner/index.ts` (Benchmark Runner)

### Purpose

Executes end-to-end benchmarking:

- discover evals
- solver stage
- LLM judge stage
- per-eval outputs
- aggregate summary

### Command

```bash
bun runner/index.ts [flags]
```

### Flags

- `--pattern <glob>`: eval selection pattern (default: `evals/**/*`)
- `--concurrency <n>`: number of evals processed in parallel (default: `4`)
- `--timeout <ms>`: timeout per model call (default: `120000`)
- `--port <n>`: OpenCode server port override (optional)
- `--solver-model <provider/model>`: solver/generator model (optional)
- `--model <provider/model>`: judge model (optional)
- `--debug`: write judge debug artifacts under `results/<run>/debug/`
- `--fail-fast`: stop the entire run on first eval error

### Mode Matrix (Behavior By Flags)

- `--solver-model` + `--model`: full generate + judge run
- `--solver-model` only: generate-only run (judge skipped, scores zero)
- `--model` only: judge runs against reference files copied by solver stage fallback
- neither flag: baseline/reference materialization only, no LLM judge, scores zero

### Examples

Full run:

```bash
bun runner/index.ts \
  --model "openai/gpt-5.3-codex" \
  --solver-model "openai/gpt-4.1-mini"
```

Generate only:

```bash
bun runner/index.ts \
  --solver-model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --pattern "evals/animation/*"
```

Full run with explicit port, timeout, and low concurrency:

```bash
bun runner/index.ts \
  --pattern "evals/animation/*" \
  --model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --solver-model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --concurrency 2 \
  --timeout 300000 \
  --port 4104
```

## `runner/judge-existing-run.ts` (Judge-Only Runner)

### Purpose

Re-judge an existing generated output set in `results/<source-run>/generated` without rerunning the solver.

Use cases:

- compare multiple judge models against the same generated outputs
- recover from interrupted judge runs
- rerun judging after judge/parser fixes

### Command

```bash
bun runner/judge-existing-run.ts [flags]
```

### Required Flags

- `--source-run <path>`: path to an existing `results/<run-id>` containing `generated/`
- `--model <provider/model>`: judge model

### Optional Flags

- `--resume-run <path>`: resume an existing judge-only output run in place
- `--pattern <glob>`: eval selection pattern (default: `evals/**/*`)
- `--concurrency <n>`: parallel judge workers (default: `2`)
- `--timeout <ms>`: timeout per judge call (default: `120000`)
- `--port <n>`: OpenCode server port override
- `--debug`: accepted by CLI parser (currently not used for extra output in this script)
- `--fail-fast`: stop on first error

### Resume Semantics (`--resume-run`)

When `--resume-run` is supplied, the script:

- reuses `results/<resume-run>/evals/` as the output directory
- loads existing per-eval judge results
- skips evals already judged for the selected pattern
- validates compatibility (source run / judge model / pattern when summary exists)
- recomputes `summary.json` from persisted per-eval results after completion

Compatibility checks reject obvious mismatches, including:

- wrong `sourceRun`
- different `judgeModel`
- different `pattern`
- non-judge-only result shape (missing `sourceGeneratedDir` in saved eval files)

### Examples

Judge everything from a prior generated run:

```bash
bun runner/judge-existing-run.ts \
  --source-run results/2026-02-25T19-43-10-237Z \
  --pattern "evals/**/*" \
  --model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M"
```

Judge only one category:

```bash
bun runner/judge-existing-run.ts \
  --source-run results/2026-02-25T19-43-10-237Z \
  --pattern "evals/animation/*" \
  --model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M"
```

Resume interrupted judge-only run:

```bash
bun runner/judge-existing-run.ts \
  --source-run results/2026-02-25T19-43-10-237Z \
  --resume-run results/2026-02-26T11-39-03-310Z \
  --pattern "evals/**/*" \
  --model "llamacpp/GLM-4.7-Flash-GGUF:Q4_K_M" \
  --concurrency 2 \
  --timeout 300000 \
  --port 4104
```

## Eval Discovery (`--pattern`)

Discovery scans for `requirements.yaml` files under the pattern.

Examples:

- `evals/**/*` - all evals
- `evals/animation/*` - all animation evals
- `evals/navigation/01*` - navigation evals with IDs starting `01`
- `evals/animation/01*` - first animation eval(s)

In judge-only mode, the pattern still applies, but generated files must also exist in:

- `results/<source-run>/generated/<eval-id>/`

## Progress Output (tqdm-style)

Both runners print progress lines like:

```text
[#######-------------] 23/140 (16.4%) | elapsed 4:12 | eta 21:37 | 11.0s/it | 0.09 it/s | llm:1 | 09-rn-...
```

Fields:

- progress bar
- `completed/total`
- percent
- elapsed time
- ETA
- average time per eval
- throughput (`it/s`)
- optional `llm:<score>`
- optional `ERROR`
- current eval ID

For resumed judge-only runs, progress starts at the already-completed count.

## Exit Behavior

Without `--fail-fast`, per-eval errors are collected and the process may still exit with code `0`.

Always inspect:

- console logs
- `summary.json` (`evalsErrored`)
- per-eval result files
