# AGENTS Guide

This file is the practical playbook for agents working in this repo.

## What this repo is

- Purpose: benchmark how coding models solve React Native tasks.
- Primary engine: `runner/` orchestrates discovery -> solve -> static checks -> LLM judge -> summary.
- Dataset: evals under `evals/<category>/<eval-id>/`, typically with:
  - `prompt.md`
  - `requirements.yaml`
  - `app/` (baseline input)
  - `reference/` (reference output for judge context)

## Mental model of execution

When you run `bun runner/index.ts`, the pipeline is:

1. Discover evals by scanning for `requirements.yaml` (`runner/utils/discovery.ts`).
2. Load eval files (`app/`, `reference/`, `requirements.yaml`, `prompt.md`).
3. Run solver stage (`runner/solver/pipeline.ts`):
  - If `--solver-model` is set, model edits `app` files.
  - If `--solver-model` is missing, runner uses `reference/` files as generated output.
4. Run code checks on generated files (`runner/evaluators/code/run.ts`):
  - `eslint` via `runner/solver/template/eslint.config.mjs`
  - `tsc --noEmit` via `runner/solver/template/tsconfig.json`
  - cyclomatic complexity calculation
5. Run LLM judge if `--model` is provided (`runner/evaluators/llm/run.ts`).
6. Write artifacts under `results/<run-id>/`.

Key output behavior:

- Per-eval results: `results/<run-id>/evals/<eval-id>.json`
- Summary: `results/<run-id>/summary.json`
- `--debug` adds judge prompt/output artifacts.

## Think-before-coding rules (required)

Apply these before implementation:

1. State assumptions explicitly.
2. If multiple interpretations exist, list them and ask or choose with justification.
3. If a simpler approach works, use it and say why.
4. If something is unclear, stop and surface the exact ambiguity.

## Execution principles (default policy)

### Before implementing

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them; do not pick silently.
- If a simpler approach exists, call it out and use it unless there is a clear reason not to.

## Simplicity and scope control

- Implement only what the task asks for.
- No speculative abstractions for single-use code.
- No drive-by refactors.
- Match surrounding style.
- Remove only dead code created by your own change.
- If you notice unrelated issues, mention them but do not fix unless asked.
- Remove imports/variables your changes made unused; do not clean pre-existing dead code unless requested.

## Surgical editing rules

- Every changed line must map directly to the request.
- Prefer minimal diff over broad rewrites.
- Keep edits local:
  - runner change -> touch `runner/**` (+ docs only if behavior changes)
  - eval content change -> touch only that eval directory
  - taxonomy/methodology/scoring change -> update `docs/**` in same PR

## Verification strategy

Pick the smallest command set that proves the change:

- Repo lint: `bun lint`
- Runner smoke run: `bun runner/index.ts --pattern "evals/<category>/<eval-id>/**" --debug --fail-fast`
- Full run (expensive): `bun runner/index.ts`
- Unit tests (when runner logic changes): `bun test runner`

For bug fixes, prefer:

1. Reproduce with a focused test or focused runner command.
2. Implement fix.
3. Re-run the same check to verify.

For multi-step tasks, include a short step plan with a verification checkpoint per step.

## Codebase-specific gotchas

- `docs/testing-your-evals.md` and `docs/benchmarking-selected-models.md` are currently placeholders (`TBD`). Do not assume they contain workflow details.
- `testbench/` is currently not wired into active runner pipeline (`testbench/README.md`).
- Root ESLint ignores `evals/**`; eval code quality in benchmark runs is checked by the runner’s template ESLint config, not root lint.
- Eval discovery depends on `requirements.yaml`; missing that file means eval is invisible to the runner.
- `requirements.yaml` runtime validation currently enforces only:
  - `version`
  - `requirements[]` with `id`, `description`, optional `weight`
  - extra fields (for example `inputs`) are ignored by current runner parser.

## Editing evals efficiently

When adding or updating an eval:

1. Keep it self-contained in one eval folder.
2. Keep prompt forward-looking (implementation ask, not bug report narrative).
3. Keep requirements atomic, concrete, and judgeable from files.
4. Keep `app/` minimal baseline and `reference/` aligned with requirements.
5. Run a targeted pattern command for that eval before broader runs.

## Documentation truth hierarchy

Use this order when deciding intent:

1. `runner/**` source code (actual behavior)
2. category research docs under `evals/<category>/README.md`
3. `docs/**`
4. root `README.md`

If behavior changes, update docs in same PR to keep this hierarchy coherent.

## Style and tooling

- Package manager: `bun`
- Formatting: single quotes, no semicolons
- Imports: sorted (`simple-import-sort`)
- Keep TypeScript/ESLint changes compatible with existing configs

## Commit messages

- Conventional Commits: `type(scope): description`
- Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`
- Lowercase, imperative, no trailing period
- Example: `fix(runner): handle missing judge rows as failed requirements`
