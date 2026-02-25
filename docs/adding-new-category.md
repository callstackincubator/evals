# Adding new category

This document defines the research and design workflow for category-level eval authoring.

## Workflow

1. Read official docs first.
- Capture core APIs, recommended patterns, and explicit caveats.
- Save source links used for design decisions.

2. Run a recent API change audit.
- Review official releases/changelogs for each core library in the category.
- Record dated changes: new preferred APIs, deprecated/removed APIs, and behavior caveats.
- Convert those findings into requirement policy (`MUST` and evidence-backed `MUST NOT`).

3. Derive prompts from best practices.
- Write prompts as normal implementation asks.
- Avoid bug-report framing.
- Map each prompt to one primary best-practice target.

4. Define deterministic requirements.
- Express requirements as file-verifiable implementation checks.
- Keep requirements atomic and concrete.

5. Validate coverage with issue intelligence (secondary input).
- Review recurring GitHub issues/discussions for setup, API misuse, performance, platform parity, edge cases, and tooling.
- Use issue clusters to test robustness coverage, not to define prompt wording.

## Required research artifact

Every new category should include a research note in the category root (for example `evals/navigation/README.md`) that includes:

- Official docs links used for eval design
- Explicit best-practice inventory (with source links)
- Issue links grouped by pain-point tags (`setup`, `API misuse`, `performance`, `platform parity`, `edge case`, `tooling`) used only to validate robustness coverage
- Traceability from each task to at least one best-practice source

## Similarity budget for technical eval sets

To avoid low-signal duplicates in technical subgroups:

1. Keep shared subgroup requirements to at most 2 IDs across sibling evals.
2. Keep at least 3 implementation-specific requirements per eval that differ across siblings.
3. Measure pairwise requirement ID overlap before finalizing the category.
4. If overlap exceeds budget, split generic checks into subgroup baseline checks and eval-specific API flow checks.
