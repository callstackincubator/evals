# plan

## implemented now

- baseline run workspace flow (`runs/<run-id>/<model>/<eval-id>/`)
- model output apply flow (file writes and patch apply)
- `unit` eval runner
- `llm-judge` eval runner with per-eval `requirements.yaml`
- Open Code SDK integration via `createOpencode` for judge execution
- aggregate report output in `results/<run-id>.json`

## current target set

- `rn-anim-animated-button-reanimated` (seed animation eval)
- navigation category pack implemented under `evals/navigation/` with 49 evals:
  - `rn-nav-*` (47 evals)
  - `rn-screens-*` (2 evals)
- all follow the standard contract (`prompt.md`, `requirements.yaml`, `app/`, optional `eval.test.ts`)

## next roadmap items

- select and lock a production judge model for Open Code Harness
- define score aggregation semantics for requirement outcomes
- run baseline-fail and reference-pass validation pass for the navigation pack
- tune any flaky deterministic checks discovered during multi-model runs
- continue category expansion with the same feature-first authoring workflow
