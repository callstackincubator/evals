# React Native Evals

A benchmark suite for evaluating how coding models solve real React Native tasks.

## Quick start

To run and evaluate any model locally, install and configure OpenCode first; the benchmark will use your current OpenCode default model, so check the selected model and pricing before you start.

Start OpenCode server:
```bash
opencode serve [--print-logs]
```

Then, generate outputs:
```bash
bun runner/run.ts --model openai/gpt-4.1-mini --output generated/my-generated
```
Default output path is `generated/<model>-<timestamp>`.

To generate a reference baseline (no solver call), use `noop`:
```bash
bun runner/run.ts --model noop
```

Judge the generated outputs:
```bash
bun runner/judge.ts --model openai/gpt-5.3-codex --input generated/my-generated
```
Default judge output path is `runs/<input-folder>/` with per-eval files in `runs/<input-folder>/evals/`.

To run specific eval, do:
```bash
bun runner/run.ts --pattern "evals/animation/01*" --model "openai/gpt-5.3-codex" --output generated/my-generated
bun runner/judge.ts --model "openai/gpt-5.3-codex" --input generated/my-generated
```

## What this repository includes

- evals under `evals/<category>/<eval-id>/`

Each eval is expected to include:
- `prompt.md`
- `requirements.yaml`
- `app/` (baseline source context used to generate benchmark output)
- `reference/` (judge reference context)

## Common commands

Use these commands for the most common local workflows:

```bash
bun runner/run.ts --model openai/gpt-4.1-mini
bun runner/run.ts --model noop --output generated/reference-generated
bun runner/judge.ts --input generated/reference-generated --model openai/gpt-5.3-codex
bun runner/judge.ts --input generated/reference-generated --model openai/gpt-5.3-codex --debug
bun lint
```

## Documentation

All detailed guides live in [docs](./docs).

## Contributing

See `CONTRIBUTING.md` for branch naming, commit format, validation expectations, and PR workflow.

## License

MIT (`LICENSE`)
