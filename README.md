# React Native Evals

This repository benchmarks how coding models solve real React Native tasks.

## Getting started

1. Install dependencies:
   - `bun install`
2. Create local runner config:
   - `cp config.json.example config.json`
3. Edit `config.json` and set:
   - `apiKey` (required unless `mockTestedLLM` is `true`)
   - optional `baseURL` (keep `null` for default OpenAI endpoint)

## Eval layout

- Evals are organized by category under `evals/<category>/<eval-id>/`.
- Every eval is self-contained and includes `prompt.md` and `requirements.yaml`.
- Optional files like `app/` and `eval.test.ts` may exist, but the active runner uses `requirements.yaml`.
- Authoring guidance is defined in `docs/llm/llm-benchmark-authoring-spec-v1.md`.

## LLM-judge runner

The runner evaluates each eval by reading `requirements.yaml`, loading declared `inputs.files`, running a placeholder solver model call through AI SDK OpenAI API, and then running:
- one structured-output LLM judge call through Open Code (`ai-sdk-provider-opencode-sdk`)
- static code checks (cyclomatic complexity, eslint, tsc) on solver outputs

## Conceptual flow

Execution is phase-based and mixes sequential stages with bounded concurrency:

1. Discover and select evals
   - Find evals from `config.json` `pattern` (default `evals/**/requirements.yaml`)
   - Apply optional `--just-one` limit
2. Prepare run outputs
   - Create run directories and generated workspace
3. Process evals concurrently (up to `concurrency`)
   - Each eval runs independently in a worker slot
4. Per-eval solver stage (multi-step loop, max 10)
   - Load requirements, input files, optional `example/`, and prompt
   - Copy template config files into generated eval directory
   - For each step: run solver -> run code evaluator (`eslint`, `tsc`, `CC`) -> collect step metrics
   - Stop when no code issues remain, or early-stop in `mockTestedLLM` mode
5. Per-eval judge stage
   - Run LLM judge on the final generated files (or mocked output when `mockJudgeLLM=true`)
   - Map requirement verdicts to score
6. Persist and report
   - Write per-eval JSON
   - Optionally write debug prompt/output artifacts
   - Print per-eval progress logs and final table
   - Write run-level `summary.json`

Concurrency model:

- run-level: multiple evals execute in parallel (`concurrency`)
- eval-level: solver loop steps are sequential (step `n+1` depends on step `n` output)
- within each step: solver execution and code evaluation are sequential
- after solver stage: judge runs once on final step output for that eval

## Requirements-based judging

LLM-judge reads `requirements.yaml` from each eval folder.

Minimal schema:

```yaml
version: 1
inputs:
  files:
    - app/App.tsx
requirements:
  - id: uses-reanimated-library
    description: Must use react-native-reanimated to animate the button interaction.
    weight: 2
```

`weight` is optional and defaults to `1.0` for scoring.

### Scoring

Per eval:

- `passedWeight = Σ(weight where passed=true)`
- `totalWeight = Σ(all weights)`
- `ratio = passedWeight / totalWeight`

## Runner configuration

Runner configuration is read from root `config.json`:

- `concurrency`
- `model`
- `solverModel`
- `mockTestedLLM` (use mocked tested-model output)
- `mockJudgeLLM` (use mocked judge decisions)
- `apiKey`
- `baseURL` (`null` to use default OpenAI endpoint)
- `pattern`
- `timeout`
- `port`
- `solverTimeout`

Runtime-only CLI flags:

- `--debug`
- `--fail-fast`
- `--just-one`

## How to run

Run all discovered evals (`evals/**/requirements.yaml`):

```bash
bun runner/index.ts
```

Update concurrency:

```bash
# edit config.json: "concurrency": 2
bun runner/index.ts
```

Run a subset by pattern (for example animation only):

```bash
# edit config.json: "pattern": "animation/**/requirements.yaml"
bun runner/index.ts
```

Enable debug artifacts:

```bash
bun runner/index.ts --debug
```

Change judge model:

```bash
# edit config.json: "model": "openai/gpt-5.3-codex"
bun runner/index.ts
```

Change judge timeout and port:

```bash
# edit config.json: "timeout": 120000, "port": 4096
bun runner/index.ts
```

## Output artifacts

For each run:

- `results/<run-id>/summary.json`
- `results/<run-id>/evals/<eval-id>.json`
- `results/<run-id>/debug/<eval-id>/judge-prompt.txt` and `judge-output.json` (debug mode only)

## Repository structure

```text
evals/
  <category>/
    README.md
    <eval-id>/
      prompt.md
      requirements.yaml
      app/ (optional)
runner/
  index.ts
  evaluators/
    code/
      run.ts
    llm/
      run.ts
      discovery.ts
      requirements.ts
      files.ts
      judge-client.ts
      prompt.ts
      utils.ts
      output.ts
      tests/
        *.test.ts
  solver/
    index.ts
    pipeline.ts
results/
docs/
```
