# React Native Evals

![React Native Evals banner](./assets/banner.jpg)

A benchmark suite for evaluating how coding models solve real React Native tasks.

## Quick start

Install dependencies:

```bash
bun install
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

Run a focused subset:

```bash
bun runner/run.ts --pattern "evals/animation/01*" --model "openai/gpt-5.3-codex" --output generated/my-generated
bun runner/judge.ts --model "openai/gpt-5.3-codex" --input generated/my-generated
```

## What this repository includes

- evals under `evals/<category>/<eval-id>/`

Each eval includes:

- `prompt.md`
- `requirements.yaml`
- `app/` baseline input files for solver stage
- `reference/` reference files for judge context and oracle mode

## Common commands

```bash
bun runner/run.ts --model openai/gpt-4.1-mini
bun runner/run.ts --model noop --output generated/reference-generated
bun runner/judge.ts --input generated/reference-generated --model openai/gpt-5.3-codex
bun runner/judge.ts --input generated/reference-generated --model openai/gpt-5.3-codex --debug
bun lint
```

## Documentation

Detailed guides live in [docs](./docs), and methodology/scoring details are in [paper/benchmark-methodology-whitepaper.tex](./paper/benchmark-methodology-whitepaper.tex).

## Contributing

See `AGENTS.md` for branch naming, commit format, validation expectations, and PR workflow.

## License

MIT (`LICENSE`)
