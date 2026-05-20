# Contributing

Thanks for contributing to React Native Evals.

## Ways To Contribute

- Request new eval coverage by opening an [issue](https://github.com/callstackincubator/evals/issues/new/choose)
- Add or improve evals under `evals/<category>/<eval-id>/`
- Improve runner, judging, docs, and methodology alignment

## Repository Structure

Each eval lives under `evals/<category>/<eval-id>/` and typically includes:

- `prompt.md`
- `requirements.yaml`
- `app/` baseline input files for solver stage
- `reference/` files used for judge context and authoring validation

## Common Commands

```bash
bun install
bun runner/run.ts --model openai/gpt-4.1-mini
bun runner/run.ts --model noop --output generated/reference-generated
bun runner/judge.ts --input generated/reference-generated --model openai/gpt-5.3-codex
bun runner/judge.ts --input generated/reference-generated --model openai/gpt-5.3-codex --debug
bun runner/run.ts --pattern "evals/animation/01*" --model "openai/gpt-5.3-codex" --output generated/my-generated
bun runner/judge.ts --model "openai/gpt-5.3-codex" --input generated/my-generated
bun lint
```

## Contribution Rules

For branch naming, commit format, and verification expectations, follow [`AGENTS.md`](./AGENTS.md).
