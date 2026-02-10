# React Native Evals

This repository benchmarks how coding models solve real React Native tasks.

## Eval layout

- Evals are organized by category under `evals/<category>/<eval-id>/`.
- Every eval is self-contained and includes `prompt.md` and `requirements.yaml`.
- Optional files like `app/` and `eval.test.ts` may exist, but the active runner uses `requirements.yaml`.
- Authoring guidance is defined in `docs/benchmark-authoring-spec-v1.md`.

## LLM-judge runner

The runner evaluates each eval by reading `requirements.yaml`, loading declared `inputs.files`, and running one structured-output judge call per eval through Open Code (`ai-sdk-provider-opencode-sdk`).

### Requirements schema

```yaml
version: 1
inputs:
  files:
    - app/App.tsx
    - app/package.json
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

## Runner defaults

Fixed defaults:

- discovery root: `evals`
- discovery pattern: `**/requirements.yaml` (override via `--pattern`)
- output dir: `results`
- per-eval JSON artifacts: enabled

## How to run

Run all discovered evals (`evals/**/requirements.yaml`):

```bash
bun runner/index.ts
```

Limit concurrency:

```bash
bun runner/index.ts --limit-concurrency 2
```

Run a subset by pattern (for example animation only):

```bash
bun runner/index.ts --pattern 'animation/**/requirements.yaml'
```

Enable debug artifacts:

```bash
bun runner/index.ts --debug
```

Override judge model:

```bash
bun runner/index.ts --model openai/gpt-5.3-codex
```

Override judge timeout and port:

```bash
bun runner/index.ts --timeout 120000 --port 4096
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
  llm/
    run.ts
    config.ts
    discovery.ts
    requirements.ts
    files.ts
    judge-client.ts
    prompt.ts
    utils.ts
    output.ts
    tests/
      *.test.ts
results/
docs/
```
