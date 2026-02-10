# methodology

This repository currently evaluates React Native tasks with a single primary runner:

1. `llm-judge`
- requirement-based checks from `requirements.yaml`
- one structured-output judge call per eval
- numeric weighted scoring per eval

## requirement format

Each eval defines requirement checks in `requirements.yaml`.

Required fields:

- `version`
- `inputs.files` (files provided to the judge)
- `requirements[]` with `id` and `description`

Optional field:

- `requirements[].weight`

Authoring guidance:

- prefer atomic requirement descriptions
- use `description: Must ...` phrasing
- include `weight` only when weighted influence is intentional

## llm judge output contract

Judge output is schema-constrained using AI SDK structured output (`Output.object`).

The schema includes:

- `summary` (optional string)
- `requirements[]` with `id`, `passed`, `reason`, `evidence[]`, `confidence?`

## scoring model

For each requirement:

- `weight = requirements[].weight ?? 1.0`

For each eval:

- `passedWeight = Σ(weight where passed=true)`
- `totalWeight = Σ(all weights)`
- `ratio = passedWeight / totalWeight`

Failure handling:

- missing requirement row from judge output is treated as failed with explicit reason
- invalid requirements YAML or missing declared input files produces eval-level errors and score ratio `0`

## result model

Per run:

- one per-eval JSON artifact (when enabled) containing requirement results, score, and errors
- one aggregate `summary.json` with totals and index entries for per-eval artifacts

Primary reporting is numeric scoring plus requirement-level evidence; no global pass/fail gate is required.

## category workflow (required for new eval categories)

Before writing new eval tasks for a category, follow the workflow in `docs/benchmark-authoring-spec-v1.md`:

1. read official docs first
2. extract best-practice rules from those docs
3. write feature requests in regular developer language
4. define deterministic outcomes and constraints from those feature requests
5. mine recurring GitHub issues/discussions as secondary validation
6. validate tasks against best-practice checks and known failure modes

## required research artifact

Every new category should include a research note in the category root (for example `evals/navigation/README.md`) that includes:

- official docs links used for task design
- explicit best-practice inventory (with source links)
- issue links grouped by pain-point tags (`setup`, `API misuse`, `performance`, `platform parity`, `edge case`, `tooling`) used only to validate robustness coverage
- a task list written as feature-building developer requests
- deterministic assertions for each task
- traceability from each task to at least one best-practice source (issue trace optional)

## task framing rule

Eval prompts must be forward-looking implementation asks, as if requested by a regular app developer. Avoid framing prompts as historical bug reproductions.
