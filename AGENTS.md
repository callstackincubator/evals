# Agent Style Guide

This file defines how agents should work in this repository.

## Commit Messages

- Use Conventional Commits format: `type(scope): description`
- Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`
- Scope is optional; use package/eval name when relevant
- Use lowercase
- Do not end with a period
- Use imperative mood
- Example: `feat(runner): add maxSteps setting for tool iterations`

## Branch Naming

- Format: `type/kebab-case-description`
- Allowed prefixes: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `ci/`
- Examples:
  - `feat/tool-calling`
  - `fix/streaming-first-char-missing`

## Stacked PRs

- Create feature branches from `main`
- Keep commits atomic and independently reviewable
- One logical change per commit
- Reference related PRs in commit messages when building on unmerged work

## Code Style

- Package manager: `bun` (do not use npm or yarn)
- No semicolons
- Use single quotes
- Keep imports sorted (ESLint enforces this)
- Run `bun lint` before committing

## Project-Specific Rules

- This project benchmarks real React Native task performance across:
  - models
  - skills
  - agents
  - implementation techniques
- Evals are self-contained under `evals/<eval-id>/` or `evals/<category>/<eval-id>/` and should not depend on shared app code
- Core eval structure for each eval:
  - `prompt.md`
  - `requirements.yaml`
  - `app/`
  - `reference/`

## Running and Verification

- Testing evals: `bun runner/index.ts`

## Documentation Hygiene

- Use `./docs` as the source of truth for methodology and design choices before implementing changes
- When changing concepts, taxonomy, scoring semantics, or workflow behavior, update the relevant files under `docs/` in the same PR
- Keep `README.md` and `docs/` aligned so contributor guidance matches current repository behavior
