# plan

## implemented now

- modular `llm-judge` runner with per-eval `requirements.yaml`
- glob-based eval discovery (`evals/**/requirements.yaml`)
- weighted requirement scoring (`weight ?? 1.0`)
- Open Code SDK integration via `createOpencode` for judge execution
- per-eval artifacts in `results/<run-id>/evals/*.json`
- aggregate summary output in `results/<run-id>/summary.json`

## current target set

- animation category bootstrapped under `evals/animation/` with 15 pilot evals:
  - `rn-anim-*` + `rn-rngh-*` + `rn-worklets-*` + keyboard-controller focused tasks (15 evals)
  - all 15 evals now include full `app/` scaffolds and code-backed requirements inputs
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
- animation pilot is fully scaffolded at 15 evals
- lists pilot is currently text-only
- storage pilot is currently text-only
- device-permissions pilot is currently text-only

## next roadmap items

- select and lock a production judge model for Open Code Harness
- run baseline-fail and reference-pass validation pass for the navigation pack
- run baseline-fail and reference-pass validation passes for new category pilots as scaffolds are introduced
- tune any flaky deterministic checks discovered during multi-model runs
- continue category expansion with the same feature-first authoring workflow
