# React Native Evals

This repository benchmarks how coding models solve real React Native tasks.

## Eval layout

- Evals are organized by category under `evals/<category>/<eval-id>/`.
- Every eval is self-contained and includes `prompt.md` and `requirements.yaml`.
- Optional files like `app/` and `eval.test.ts` are included when required by that category or eval.
- Runner output is written under `runs/` (workspace artifacts) and `results/` (aggregate report).
- Authoring guidance is defined in `docs/benchmark-authoring-spec-v1.md`.

## Evaluation runners

The bench runner supports multiple evaluation runners in one pass:

- `unit`: executes `eval.test.ts` in the run workspace when present; otherwise returns `skipped`.
- `llm-judge`: evaluates YAML requirements with Open Code Harness through the SDK (primary runner).

Configure enabled runners in `bench.config.json` under `runners`.

## Requirements-based judging

LLM-judge reads `requirements.yaml` from each eval folder.

Minimal schema:

```yaml
version: 1
inputs:
  files:
    - app/App.tsx
    - app/package.json
requirements:
  - id: uses-reanimated-library
    description: Must use react-native-reanimated to animate the button interaction.
```

Judge results are persisted in each workspace and included in `run-results.json` and `results/<run-id>.json`.

## Open Code Harness integration

The judge runner uses AI SDK v6 + `ai-sdk-provider-opencode-sdk` (`createOpencode`) to access Open Code.

Optional environment variables:

- `LLM_JUDGE_MODEL` (default: `openai/gpt-5.3-codex`)
- `LLM_JUDGE_TIMEOUT_MS` (default: `120000`)
- `LLM_JUDGE_PORT` (default: `4096`)

## Structured judge output

The judge uses AI SDK structured output (`Output.object`) with a schema that includes:

```json
{
  "summary": "optional summary",
  "requirements": [
    {
      "id": "uses-reanimated-library",
      "passed": true,
      "reason": "why this passed or failed",
      "evidence": ["supporting evidence"],
      "confidence": 0.9
    }
  ]
}
```

## How to run

Run all discovered evals:

```bash
bun runner/index.ts --all
```

Run local noop benchmark:

```bash
bun run bench:local
```

Run one eval:

```bash
bun runner/index.ts --eval 01-rn-nav-stack-product-details
```

Run with explicit config:

```bash
bun runner/index.ts --config bench.config.json --all
```

## Repository structure

```text
evals/
  <category>/
    README.md
    <eval-id>/
      prompt.md
      requirements.yaml
      app/ (optional)
      eval.test.ts (optional)
runner/
  index.ts
  config.ts
  evals/
    discover.ts
  runners/
    index.ts
    unit.ts
    llm-judge.ts
  judge/
  model/
  report/
bench.config.json
bench.local.json
runs/
results/
docs/
```
