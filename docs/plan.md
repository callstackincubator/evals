# plan

## implemented now

- baseline run workspace flow (`runs/<run-id>/<model>/<eval-id>/`)
- model output apply flow (file writes and patch apply)
- `unit` eval runner
- `llm-judge` eval runner with per-eval `requirements.yaml`
- Open Code SDK integration via `createOpencode` for judge execution
- aggregate report output in `results/<run-id>.json`

## current target set

- animation category bootstrapped under `evals/animation/` with 15 pilot evals:
  - `rn-anim-*` + `rn-rngh-*` + `rn-worklets-*` + keyboard-controller focused tasks (15 evals)
  - current stage is text-only (`prompt.md`, `requirements.yaml`), app scaffolds intentionally removed
- async-state category bootstrapped under `evals/async-state/` with 16 pilot evals:
  - `rn-rq-*` + `rn-zustand-*` + `rn-jotai-*` + `rn-react-*` tasks (16 evals)
  - focus areas include TanStack Query, Zustand, Jotai async atoms, Suspense, and transitions
  - current stage is text-only (`prompt.md`, `requirements.yaml`), app scaffolds intentionally removed
- lists category bootstrapped under `evals/lists/` with 18 pilot evals:
  - core `FlatList` / `SectionList`, `@shopify/flash-list`, and `legend-list` task coverage
  - current stage is text-only (`prompt.md`, `requirements.yaml`), app scaffolds intentionally removed
- storage category bootstrapped under `evals/storage/` with 18 pilot evals:
  - offline-first persistence and reconciliation coverage across `@react-native-async-storage/async-storage`, `react-native-mmkv`, and `expo-sqlite`
  - current stage is text-only (`prompt.md`, `requirements.yaml`), app scaffolds intentionally removed
- device-permissions category bootstrapped under `evals/device-permissions/` with 24 pilot evals:
  - `expo-camera`, `expo-image-picker`, `expo-location`, `expo-notifications`, `react-native-permissions`, and `react-native-image-picker` coverage
  - current stage is text-only (`prompt.md`, `requirements.yaml`), app scaffolds intentionally removed
- navigation category pack implemented under `evals/navigation/` with 50 evals:
  - `rn-nav-*` (48 evals)
  - `rn-screens-*` (2 evals)
- navigation evals follow the full standard contract (`prompt.md`, `requirements.yaml`, `app/`, optional `eval.test.ts`)
- animation pilot is currently text-only
- lists pilot is currently text-only
- storage pilot is currently text-only
- device-permissions pilot is currently text-only

## next roadmap items

- select and lock a production judge model for Open Code Harness
- define score aggregation semantics for requirement outcomes
- run baseline-fail and reference-pass validation pass for the navigation pack
- run baseline-fail and reference-pass validation passes for new category pilots as scaffolds are introduced
- tune any flaky deterministic checks discovered during multi-model runs
- continue category expansion with the same feature-first authoring workflow
