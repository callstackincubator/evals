# React Native Evals

This repository benchmarks how coding models solve real React Native tasks.

## Current state

- Evals are self-contained under `evals/<eval-id>/` or `evals/<category>/<eval-id>/`.
- The repository includes:
  - 50 navigation evals under `evals/navigation/` (`rn-nav-*` and `rn-screens-*`) based on React Navigation and react-native-screens best practices.
  - 16 animation pilot evals under `evals/animation/` focused on Reanimated, Gesture Handler, Worklets, and keyboard-controller motion patterns.
    - animation pilot is currently text-only (`prompt.md` + `requirements.yaml`) with no `app/` scaffolds yet.
  - 2 legacy root-level animation seed evals kept for backward compatibility (`rn-anim-animated-button-reanimated`, `rn-anim-animated-button-prefer-reanimated`).
- Runner output is written under `runs/` (workspace artifacts) and `results/` (aggregate report).
- Baseline authoring and category guidance is defined in `docs/benchmark-authoring-spec-v1.md`.

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
  <eval-id>/
    ...
  animation/
    README.md
    <eval-id>/
      prompt.md
      requirements.yaml
      eval.test.ts (optional)
  navigation/
    README.md
    <eval-id>/
      prompt.md
      requirements.yaml
      eval.test.ts (optional)
      app/
        App.base.tsx
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
