# React Native Evals

A benchmark suite for evaluating how coding models solve real React Native tasks.

## Quick start

Install dependencies:

```bash
bun install
```

Run a full benchmark with explicit solver and judge models:

```bash
bun runner/index.ts --solver-model "<solver-model>" --model "<judge-model>"
```

Run a focused subset:

```bash
bun runner/index.ts --pattern "evals/animation/01*" --solver-model "<solver-model>" --model "<judge-model>"
```

## What this repository includes

- evals under `evals/<category>/<eval-id>/`

Each eval includes:

- `prompt.md`
- `requirements.yaml`
- `app/` baseline input files for solver stage
- `reference/` reference files for judge context and oracle mode

## How evaluation works

For each discovered eval:

1. Load `app/`, `reference/`, `requirements.yaml`, and `prompt.md`.
2. Run solver stage (`--solver-model`), or materialize `reference/` files if solver model is omitted.
3. Run judge stage when `--model` is provided.
4. Write artifacts under `results/<run-id>/`.

## Common commands

```bash
bun runner/index.ts
bun runner/index.ts --debug
bun runner/index.ts --pattern "evals/<category>/<eval-id>/**" --debug --fail-fast
bun lint
```

## Documentation

Detailed guides live in [docs](./docs), and methodology/scoring details are in [paper/benchmark-methodology-whitepaper.tex](./paper/benchmark-methodology-whitepaper.tex).

## Contributing

See `AGENTS.md` for branch naming, commit format, validation expectations, and PR workflow.

## License

MIT (`LICENSE`)
