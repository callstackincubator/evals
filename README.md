# react native evals

This repo evaluates model performance on React Native tasks using self-contained evals and a Bun-based runner.

## structure

```
evals/<eval-id>/
  prompt.md
  eval.test.ts
  app/
  package.json
  tsconfig.json
runner/
bench.config.json
reports/
runs/
```

## eval types (animation group example)

- behavior: end-user behavior only
- preference: behavior plus preference scoring
- constraint: behavior plus required technique

## how to run

Run a single eval:

```
bun runner/index.ts --eval rn-anim-animated-button-reanimated
```

Run all evals:

```
bun runner/index.ts --all
```

## model output

- set `MODEL_OUTPUT_JSON` to a JSON file with `{ "patch": "..." }` or `{ "files": [{ "path": "...", "content": "..." }] }`
- or set `MODEL_OUTPUT_PATH` to a unified patch file

## config

See `bench.config.json` for model list, eval selection, and report path.

## docs

- `docs/plan.md`: saved plan
- `docs/methodology.md`: evaluation types and reporting
- `docs/adding-an-eval.md`: add a new eval
