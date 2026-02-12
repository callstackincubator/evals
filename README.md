# React Native Evals

A benchmark suite for evaluating how coding models solve real React Native tasks.

## What this repository includes

- evals under `evals/<category>/<eval-id>/`
- a runner that executes solver + judge + static checks

Each eval is expected to include:
- `prompt.md`
- `requirements.yaml`
- `app/` (baseline source context used to generate benchmark output)
- `example/` (judge reference context)

## How evaluation works

For each eval:
1. load `app/**` as baseline input
2. run the eval prompt on that baseline to generate output to benchmark
3. evaluate generated output with static checks (`eslint`, `tsc`, cyclomatic complexity) and one LLM judge call
4. compute weighted requirement score

## Quick start

To run and evaluate locally, install and configure OpenCode first; the benchmark will use your current OpenCode default model, so check the selected model and pricing before you start.

1. Install dependencies:
   - `bun install`
2. Create local config:
   - `cp config.json.example config.json`
3. Set required config values in `config.json`:
   - `apiKey` (required unless `mockTestedLLM` is `true`)
   - optional `baseURL` (leave `null` for default OpenAI endpoint)
4. Run:
   - `bun runner/index.ts`

## Common commands

Use these commands for the most common local workflows:

```bash
bun runner/index.ts
bun runner/index.ts --just-one
bun runner/index.ts --debug
bun lint
```

## Documentation

All detailed guides live in [docs](./docs).

## Contributing

See `CONTRIBUTING.md` for branch naming, commit format, validation expectations, and PR workflow.

## License

MIT (`LICENSE`)
