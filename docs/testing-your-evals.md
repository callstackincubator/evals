# Testing Your Evals

Use this workflow to validate evals end-to-end with split generation and judge CLIs.

## 1) Run generation from `reference/` (noop solver)

This mode does not call a solver model. It copies each eval's `reference/` files into the generated output folder and writes a manifest consumed by the judge.

```bash
bun runner/run.ts --model noop --output generated/reference-generated
```

For a single eval:

```bash
bun runner/run.ts --pattern "evals/animation/01*" --model noop --output generated/reference-generated
```

## 2) Run judge on generated artifacts

```bash
bun runner/judge.ts --model openai/gpt-5.3-codex --input generated/reference-generated
```

Judge scope is inferred from the manifest in `--input`; there is no separate `--pattern` for judge.
Judge outputs are written incrementally to `runs/<input-folder>/evals/`, so completed eval results remain on disk even if the process is interrupted.

## 3) Optional debug artifacts

```bash
bun runner/judge.ts --model openai/gpt-5.3-codex --input generated/reference-generated --debug
```

## 4) Basic validation

Before opening a PR, run:

```bash
bun lint
```
