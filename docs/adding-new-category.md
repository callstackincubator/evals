# Adding new category

This document is the baseline for creating and reviewing React Native evals at scale.

## Rresearch

Use this workflow for every category before writing evals.

1. **Read official docs first**

- Collect core APIs, recommended patterns, and explicit caveats
- Capture links to source sections used for task design

2. **Extract best-practice rules**

- Turn docs into a concise list of do/don't implementation rules
- Keep rules concrete enough to assert in requirement checks (and unit tests when present)

3. **Dderive feature asks from best practices**

- Write prompts as requests a regular developer would make
- Avoid bug-report language in prompt text
- Map each prompt to one primary best-practice rule

4. **Define deterministic checks**

- Express expected user-visible outcomes as deterministic assertions
- Add minimal atomic requirement checks that enforce the target best practice

5. **Mine common issues (secondary validation)**

- Inspect top GitHub issues/discussions for main libraries in the category
- Prioritize issues with high reactions, repeated duplicates, or recurring regressions
- Tag each issue as: setup, API misuse, performance, platform parity, edge case, or tooling
- Use issue clusters to stress-test coverage, not to define prompt language

6. **Apply best-practice checks**

- Verify task enforces recommended usage patterns from docs
- Verify task avoids anti-patterns commonly seen in issue threads

## Required research artifact

Every new category should include a research note in the category root (for example `evals/navigation/README.md`) that includes:

- Official docs links used for eval design
- Explicit best-practice inventory (with source links)
- Issue links grouped by pain-point tags (`setup`, `API misuse`, `performance`, `platform parity`, `edge case`, `tooling`) used only to validate robustness coverage
- Traceability from each task to at least one best-practice source
