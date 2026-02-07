# methodology

This repository currently evaluates React Native tasks with two complementary runners:

1. `unit`
- optional deterministic checks from `eval.test.ts`
- reported as `skipped` when no unit test file exists for an eval

2. `llm-judge`
- requirement-based checks from `requirements.yaml`
- evaluates implementation quality against structured requirement descriptions
- primary evaluation signal for the current eval set

## requirement format

Each eval can define requirement checks in `requirements.yaml`.

Required fields:

- `version`
- `inputs.files` (files provided to the judge)
- `requirements[]` with `id` and `description`

Optional field:

- `requirements[].weight`

Current authoring guidance:

- prefer atomic requirement descriptions
- use `description: Must ...` phrasing
- omit `weight` unless weighted scoring is intentionally introduced

## llm judge output contract

Judge output is schema-constrained using AI SDK structured output (`Output.object`).

The schema includes:

- `summary` (optional string)
- `requirements[]` with `id`, `passed`, `reason`, `evidence[]`, `confidence?`

## result model

Per eval/model run:

- each enabled runner writes a result entry under `runner_results`
- overall run `status` is derived from runner statuses (`error` > `fail` > `pass`)

LLM judge result shape includes:

- `status`
- `requirement_results[]` with `id`, `passed`, `reason`, and `evidence`

Scoring aggregation beyond raw requirement outcomes is intentionally out of scope for this phase.

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

This keeps category expansion auditable, aligned with real product work, and resilient to known regressions.

## task framing rule

Eval prompts must be forward-looking implementation asks, as if requested by a regular app developer. Avoid framing prompts as historical bug reproductions.

## execution path (authoring to completion)

Use this sequence for each category:

1. research and scope
- read official docs
- extract best-practice rules
- collect recurring issues as secondary validation

2. define eval set
- write feature-style prompts
- create deterministic `requirements.yaml` checks
- keep requirements atomic and phrased as `Must ...`

3. scaffold eval apps
- add minimal `app/` starters for every eval
- keep scaffolds intentionally incomplete so requirements can fail before implementation

4. implement first pass
- implement `app/App.tsx` for the full eval set (batch by difficulty or theme)
- keep changes minimal and aligned to each prompt/requirement

5. refine requirements after implementation
- add tighter requirements that reflect best-practice implementation where needed
- focus tightening on required navigation/library APIs (for example deep-link config, `useFocusEffect`, `beforeRemove`, state persistence precedence)

6. verify and re-run
- run llm-judge across the full set
- fix implementation bugs
- run llm-judge again after fixes

7. complete and lock
- confirm baseline scaffold fail + implemented pass behavior
- update category documentation with final status and remaining gaps
- mark category complete
