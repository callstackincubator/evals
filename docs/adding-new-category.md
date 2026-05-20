# Adding new category

This document defines the category-level authoring workflow.

## Workflow

1. Define category scope and baseline libraries.
- Identify the API surface that the category should exercise.
- Normalize library naming used in prompts, requirements, and README.

2. Read official docs and recent release notes.
- Capture source links for each core library.
- Record dated API shifts that should become requirement constraints.

3. Build category best-practice inventory.
- Convert source guidance into concrete implementation expectations.
- Keep entries deterministic and file-verifiable where possible.

4. Derive prompts from best practices.
- Write prompts as forward-looking implementation asks.
- Avoid bug-report framing.
- Map each prompt to one or more best-practice targets.

5. Define deterministic requirements.
- Express requirements as file-verifiable checks.
- Keep requirements atomic and concrete.
- Use evidence-backed `MUST NOT` only for deprecations/removals/correctness caveats.

6. Validate diversity and overlap.
- Keep shared subgroup requirements small.
- Ensure each eval has implementation-specific constraints.

## Required category README artifact

Every new category should include `evals/<category>/README.md` with exactly:

- `category overview`
- `library baseline and naming`
- `best practices`
  - official best-practice sources
  - best-practice inventory

Keep category READMEs focused on those sections only.
