# Announcing React Native Evals

## Scaffold

- Working title: Announcing React Native Evals
- Audience: React Native engineers, engineering managers, and AI tooling teams evaluating coding models on practical mobile tasks.
- Tone: practical, technical, direct; short sections; concrete claims; end with a clear call to action.

Section plan:
1. What is React Native Evals?
2. Why we made it
3. What models and categories are currently benchmarked
4. What categories are planned
5. Our methodology
6. Check out the repository

---

## Draft Article

React Native teams are moving fast with AI-assisted coding, but it is still hard to answer a basic question with confidence: **which model actually performs better on real React Native work?**

Today we are open-sourcing **React Native Evals**, a benchmark suite designed to evaluate coding models on practical React Native tasks.

### What is React Native Evals?

React Native Evals is a task-based benchmark for model-generated code.

Each eval is a self-contained task in `evals/<category>/<eval-id>/` with:
- a task prompt (`prompt.md`)
- judgeable requirements (`requirements.yaml`)
- a baseline app scaffold (`app/`)
- a reference implementation (`reference/`)

The repository currently includes **136 evals** across seven category groups:
- `animation` (13)
- `async-state` (13)
- `device-permissions` (24)
- `expo-sdk` (1)
- `lists` (18)
- `navigation` (49)
- `storage` (18)

### Why we made it

We built this benchmark to make model quality discussions less anecdotal and more reproducible.

Most model comparisons in app development are still based on demos, one-off prompts, or generic coding tasks. That does not reflect the edge cases mobile teams hit every day: navigation state correctness, virtualization performance pitfalls, permission handling, offline persistence, and threading constraints in animations.

React Native Evals focuses on those implementation details so teams can compare models on tasks that look closer to production work.

### What models and categories are currently benchmarked?

Based on current repository run artifacts (as of **February 27, 2026**), benchmark runs include:
- `gpt-4.1-mini`
- `gpt-5.3-codex`
- `noop` reference baseline mode (used to validate the judging pipeline without solver generation)

Category coverage is currently:
- animation
- async state
- device permissions
- Expo SDK
- lists and virtualization
- navigation
- storage/offline

### What categories are planned?

There is no fixed public roadmap list of future category names in-repo yet.

Current direction is to:
- continue expanding depth and coverage in the existing seven categories
- add new categories through the documented category workflow (`docs/adding-new-category.md`)
- prioritize categories with clear, judgeable implementation constraints and strong primary-source API guidance

If you publish this post with a committed roadmap, replace this section with your concrete next category list.

### Our methodology

React Native Evals uses a split pipeline:

1. **Generation stage** (`bun runner/run.ts`)
- discovers evals from `requirements.yaml`
- runs a solver model against each eval prompt + baseline files
- writes generated outputs plus a manifest

2. **Judge stage** (`bun runner/judge.ts`)
- reads generated outputs
- evaluates each declared requirement with an LLM judge
- writes per-eval results and run summaries

Scoring is requirement-based with optional requirement weights.

At the eval level, passed requirements are normalized into a `scoreRatio`.
At the run level, `weightedAverageScore` is the mean of successful eval `scoreRatio` values.

This keeps the benchmark transparent: you can inspect prompts, requirements, generated files, and judge outputs directly.

### Check out the repository

If you want to run it, extend it, or benchmark your own model setup, start here:

- Repository: [github.com/callstackincubator/evals](https://github.com/callstackincubator/evals)
- Methodology whitepaper: `paper/benchmark-methodology-whitepaper.tex`
- Quick start:
  - `bun runner/run.ts --model openai/gpt-4.1-mini --output generated/my-generated`
  - `bun runner/judge.ts --model openai/gpt-5.3-codex --input generated/my-generated`

If you run experiments with it, share your findings and setup details so results are reproducible across teams.
