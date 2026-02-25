# React Native Evals

A benchmark suite for evaluating how coding models solve real React Native tasks.

## Quick start

To run and evaluate any model locally, install and configure OpenCode first; the benchmark will use your current OpenCode default model, so check the selected model and pricing before you start.

Start OpenCode server:
```bash
opencode serve [--print-logs]
```

Then, run the CLI:
```bash
bun runner/index.ts --model openai/gpt-5.3-codex --solver-model openai/gpt-4.1-mini
```

To run specific eval, do:
```bash
bun runner/index.ts --pattern "evals/animation/01*" --model "openai/gpt-5.3-codex" --solver-model "openai/gpt-5.3-codex"
```

## What this repository includes

- evals under `evals/<category>/<eval-id>/`

Each eval is expected to include:
- `prompt.md`
- `requirements.yaml`
- `app/` (baseline source context used to generate benchmark output)
- `reference/` (judge reference context)

## How evaluation works

For each eval:
1. load `app/**` as baseline input
2. run the eval prompt on that baseline to generate output to benchmark
3. evaluate generated output with LLM judging when `--model` is provided
4. compute weighted requirement score

## Common commands

Use these commands for the most common local workflows:

```bash
bun runner/index.ts
bun runner/index.ts --debug
bun lint
```

## Documentation

All detailed guides live in [docs](./docs).

## Contributing

See `CONTRIBUTING.md` for branch naming, commit format, validation expectations, and PR workflow.

## License

MIT (`LICENSE`)
