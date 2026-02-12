# Agent Style Guide

This file defines how agents should work in this repository.

## Git Workflow

### Commit Messages
- Use Conventional Commits format: `type(scope): description`
- Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`
- Scope is optional; use package/eval name when relevant
- Use lowercase
- Do not end with a period
- Use imperative mood
- Example: `feat(runner): add maxSteps setting for tool iterations`

### Branch Naming
- Format: `type/kebab-case-description`
- Allowed prefixes: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `ci/`
- Examples: `feat/tool-calling`, `fix/streaming-first-char-missing`

### Stacked PRs
- Create feature branches from `main`
- One logical change per commit
- Reference related PRs in commit messages when building on unmerged work

## Bun Workflow

- Package manager: `bun` (do not use npm or yarn)
- Run `bun lint` before committing
- Run evals with `bun runner/index.ts`

## Code Conventions

- No semicolons
- Use single quotes
- Keep imports sorted (ESLint enforces this)
- Prefer Bun/native APIs before custom implementations: CLI parsing `node:util` `parseArgs`, file discovery `Bun.Glob`, file existence checks `fs/promises` `exists`
- Favor the simplest implementation that satisfies requirements
- Avoid adding abstraction layers unless they are reused or clearly necessary
- Keep config shapes flat and explicit unless nesting is required
- Co-locate types with the module that owns them
- Let TypeScript infer types when clear; add explicit types only where inference is ambiguous or unsafe
- Keep line length readable; split long expressions/imports/log lines

## Comments and Language

- Use multiline block comments for function-level descriptions (`/* ... */`)
- Use `//` comments inside function bodies for stage/progress notes
- Keep comments concise and only where they improve clarity
- All README/docs content must be in English

## Eval Rules

- This project benchmarks real React Native task performance across models, skills, agents, and implementation techniques
- Evals are self-contained under `evals/<eval-id>/` or `evals/<category>/<eval-id>/` and should not depend on shared app code
- Core eval structure: `prompt.md`, `requirements.yaml`, `app/`, and optional `eval.test.ts`

## Documentation Hygiene

- Use `./docs` as the source of truth for methodology and design choices before implementing changes
- When changing concepts, taxonomy, scoring semantics, or workflow behavior, update the relevant files under `docs/` in the same PR
- Keep `README.md` and `docs/` aligned so contributor guidance matches current repository behavior
