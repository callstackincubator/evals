# plan

## implemented now

- baseline run workspace flow (`runs/<run-id>/<model>/<eval-id>/`)
- model output apply flow (file writes and patch apply)
- `unit` eval runner
- `llm-judge` eval runner with per-eval `requirements.yaml`
- Open Code SDK integration via `createOpencode` for judge execution
- aggregate report output in `results/<run-id>.json`

## current target set

- animation category bootstrapped under `evals/animation/` with 16 pilot evals:
  - `rn-anim-*` + `rn-rngh-*` + `rn-worklets-*` + keyboard-controller focused tasks (16 evals)
  - current stage is text-only (`prompt.md`, `requirements.yaml`), app scaffolds intentionally removed
- navigation category pack implemented under `evals/navigation/` with 50 evals:
  - `rn-nav-*` (48 evals)
  - `rn-screens-*` (2 evals)
- legacy root-level animation seed evals kept for compatibility:
  - `rn-anim-animated-button-reanimated`
  - `rn-anim-animated-button-prefer-reanimated`
- navigation evals follow the full standard contract (`prompt.md`, `requirements.yaml`, `app/`, optional `eval.test.ts`)
- animation pilot is currently text-only

## next roadmap items

- select and lock a production judge model for Open Code Harness
- define score aggregation semantics for requirement outcomes
- run baseline-fail and reference-pass validation pass for the navigation pack
- tune any flaky deterministic checks discovered during multi-model runs
- continue category expansion with the same feature-first authoring workflow
