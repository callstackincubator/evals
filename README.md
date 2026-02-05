# React Native Evals

This repository is a benchmark suite for evaluating how well coding models solve real React Native tasks.

It is designed to answer three practical questions:

- Can a model produce working app behavior?
- Does a model choose recommended React Native approaches when not required?
- Can a model follow explicit technical constraints when they are required?

This lets teams make better decisions about where models are strong, where they fail, and where skills or prompting strategy materially improve outcomes.

## Evaluation model

Every category is implemented as a triad of eval types:

- `behavior`: checks user-visible behavior only.
- `preference`: checks behavior and scores whether a recommended approach is used.
- `constraint`: checks behavior and enforces a required library/technique.

Results are written with these fields:

- `behavior_pass`
- `preference_pass` (when applicable)
- `constraint_pass` (when applicable)
- `overall_pass`

## Coverage categories

The complete suite spans core React Native app capabilities:

- `animation`: interactive motion and feedback behavior
- `navigation`: stack/tab routing and screen flow behavior
- `forms-validation`: form UX, validation correctness, and submission paths
- `data-fetching`: loading, success, error, and refresh handling
- `list-performance`: large lists, render strategy, and interaction performance
- `accessibility`: screen reader semantics, labels, and accessible interactions
- `device-permissions`: permission flows, fallback UX, and platform-safe handling

## Models and variants

The runner evaluates a configured model set across two run variants:

- `baseline`: standard prompt without skill assistance
- `with-skill`: prompt flow that includes skill support

Reports are structured to support direct comparison by:

- model
- variant
- category
- eval type

## Adding or changing evals

Use the contributor docs:

- `docs/adding-an-eval.md`
- `docs/methodology.md`
- `docs/running.md`

Guiding rules:

- keep evals self-contained
- keep assertions behavior-oriented
- avoid category-specific shortcuts that reduce benchmark validity

## Roadmap and tracking

Implementation work is tracked in GitHub milestones and umbrella issue:

- milestones: `M0` through `M5`
- umbrella roadmap: `https://github.com/callstackincubator/evals/issues/24`

This keeps the benchmark transparent: what exists, what is being improved, and what is intentionally deferred.

## Repository structure

```
evals/
  <category>-<task>-behavior/
  <category>-<task>-prefer-<technique>/
  <category>-<task>-<required-technique>/
    prompt.md
    eval.test.ts
    app/
runner/
  index.ts
  config.ts
  discover.ts
  workspace.ts
  model/
  report/
bench.config.json
bench.local.json
runs/
results/
docs/
```

## How to run

Run all evals:

```bash
bun runner/index.ts --all
```

Run one eval:

```bash
bun runner/index.ts --eval <eval-id>
```

Run with a specific config:

```bash
bun runner/index.ts --config bench.config.json --all
```

Run local/noop verification flow:

```bash
bun runner/index.ts --config bench.local.json --all
```

## Model output input modes

Use one of these env-driven modes when integrating model output:

- `MODEL_OUTPUT_JSON` with `{ "patch": "..." }`
- `MODEL_OUTPUT_JSON` with `{ "files": [{ "path": "...", "content": "..." }] }`
- `MODEL_OUTPUT_PATH` with a unified diff patch file

When both file writes and patch are provided, files are written first and patch is applied after.

## Output artifacts

- `runs/<run-id>/<model>/<variant>/<eval>/` workspace for each run unit
- `diff.patch` generated diff for each workspace
- `model-output.json` captured prompt/output payload
- `run-results.json` per eval/model/variant run unit
- `eval-results.json` raw eval scoring output
- `results/<run-id>.json` aggregate benchmark report
