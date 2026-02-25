# Eval Scaffolding Audit (2026-02-25)

## Scope

- Repository state: `ef40d64` (synced with `origin/main`, up to date)
- Evaluated units: all eval folders with `requirements.yaml` under `evals/**` (141 total)
- Compared artifacts per eval:
  - `prompt.md`
  - `requirements.yaml`
  - `app/App.tsx`

## Assumptions and interpretation

- "Requirement duplicated in app" means baseline `app/App.tsx` already implements behavior that is being evaluated (not merely sharing nouns).
- "Prompt contextual clarity" means the prompt should be understandable in the context of the current `app/` scaffold and should not rely on hidden evaluation constraints.
- This audit is scaffold-focused; it does not evaluate `reference/` implementations.

## Executive summary

1. **Baseline apps are overwhelmingly too thin for lifecycle-style incremental work.**
2. **Requirements are generally not pre-implemented in baseline apps** (good), but this is because baselines are near-empty (bad for realism).
3. **There is a significant prompt-to-requirement alignment gap**, especially around implementation-specific API constraints.
4. **Four evals currently have invalid `requirements.yaml` syntax** and fail strict YAML parsing.

## Quantitative findings

### A. App scaffold shape

- 141/141 evals have exactly one app file: `app/App.tsx`
- 141/141 app scaffolds are extremely small:
  - non-navigation categories: 20 LOC each
  - navigation category: 22 LOC each
- 91/141 apps are exact `Hello World` template clones.
- 50/141 apps are the same structural template with only `<Text>Implement: ...</Text>` changed.
- Baseline apps contain none of the core target primitives:
  - `FlatList`: 0
  - `SectionList`: 0
  - `NavigationContainer` / native-stack setup: 0
  - `useSharedValue` / gesture setup: 0
  - `AsyncStorage` / `MMKV` / `CameraView`: 0

Interpretation: the current baseline does not resemble "continue work in an existing app". It is effectively greenfield implementation from a blank screen.

### B. Prompt clarity and contextual grounding

- Prompt length distribution (141 evals):
  - min: 5 words
  - p50: 17 words
  - p75: 21 words
- Lists prompts are shortest:
  - 11/18 are under 12 words
  - 13/18 are under 16 words
- 0 prompts reference `App.tsx` or `app/` files explicitly.

Interpretation: prompts are usually concise and understandable in isolation, but they are weakly grounded in current app context because the app context is mostly empty and not referenced.

### C. Requirements duplicated in baseline app (`app/App.tsx`)

- Requirement phrase overlap with baseline app text: **0 matches** across parsed requirements.
- Duplicate requirement descriptions within a single `requirements.yaml`: **0 pairs** found.

Interpretation: the specific issue "baseline already includes evaluated requirements" is currently **not** the dominant failure mode. The opposite issue dominates: baselines are too minimal.

### D. Prompt vs requirements alignment

- Parsed requirements: 600 (across 137 evals; 4 YAML parse failures excluded)
- Implementation-specific requirements (`id` starts with `implementation-`): 193
- Heuristic gap check found **114/193 (59%)** implementation requirements introduce API-level constraints not explicitly surfaced in prompts.

Interpretation: many evals judge on framework/API choices that are not clearly instructed in `prompt.md`.

## High-priority issues

### P0: Invalid `requirements.yaml` syntax (blocking/tooling risk)

These files fail strict YAML parse due unquoted `:`/`!!` patterns in plain scalars:

1. `evals/async-state/02-rn-rq-dependent-query-enabled-gate/requirements.yaml`
2. `evals/async-state/03-rn-rq-mutation-invalidate-on-success/requirements.yaml`
3. `evals/storage/11-rn-storage-mmkv-multi-process-app-group/requirements.yaml`
4. `evals/storage/17-rn-storage-sqlite-change-listener-reactivity/requirements.yaml`

Example problematic lines:

- `enabled: !!profileId`
- `queryKey: ITEMS_QUERY_KEY`
- `mode: 'multi-process'`
- `enableChangeListener: true`

Fix: quote full description strings that contain YAML-special tokens.

### P1: Scaffold realism gap (all categories)

Representative baseline stubs:

- `evals/lists/02-rn-list-flatlist-onendreached-loading-guard/app/App.tsx`
- `evals/storage/01-rn-storage-asyncstorage-rehydrate-bootstrap-guard/app/App.tsx`
- `evals/device-permissions/01-rn-perm-expo-camera-request-denied-retry/app/App.tsx`

All are effectively `Hello World`, which forces model behavior toward full reimplementation instead of targeted edits.

### P1: Prompt/requirements mismatch (hidden constraints)

Representative cases where prompt is high-level but requirements enforce specific API contracts:

1. `evals/navigation/01-rn-nav-stack-product-details`
   - Prompt: generic native stack flow
   - Requirements: explicitly enforce `createStaticNavigation`, `createNativeStackNavigator`, import contracts, `useNavigation`
2. `evals/animation/10-rn-anim-worklet-thread-bridge-schedule-on-rn`
   - Prompt: off-thread compute + controlled updates
   - Requirements: explicitly enforce `scheduleOnUI`/`scheduleOnRN`, forbid deprecated `runOnUI`/`runOnJS`
3. `evals/lists/02-rn-list-flatlist-onendreached-loading-guard`
   - Prompt: 8-word high-level ask
   - Requirements: onEndReached dedupe guard + key extractor constraints + virtualization contract

## Stage-2 conclusion (requirements duplicated in baseline)

- No evidence that baseline `app/App.tsx` already implements evaluated behavior.
- Current risk is not "pre-implemented requirements" but "insufficient baseline context".
- Navigation scaffolds do duplicate prompt intent textually (`Implement: ...`) but not behaviorally.

## Refactor guidance (for next pass)

1. **Adopt category-specific starter baselines** instead of global `Hello World`.
   - Lists: include seeded list data + existing list shell; leave target behavior missing.
   - Navigation: include minimal navigator tree and sample screens; leave one behavior incomplete.
   - Storage/async-state: include pre-existing state/view model with one missing persistence/concurrency concern.
2. **Ensure each eval starts from a plausible mid-lifecycle state.**
   - Keep app functional and domain-shaped.
   - Leave exactly the evaluated capability unfinished.
3. **Align prompt and requirement strictness.**
   - If requirements enforce API choice (example: `createStaticNavigation`, `scheduleOnRN`), prompt must state it.
4. **Remove purely textual "Implement: ..." placeholders from `App.tsx`.**
   - Replace with minimal but real UI/data structure that the prompt can extend.
5. **Add YAML validation to CI for `requirements.yaml`.**
   - Fail fast on parse errors before eval discovery/judging.

## Suggested refactor sequencing

1. Fix P0 YAML parsing issues (4 files).
2. Replace `Hello World` app scaffold for lists + navigation first (highest volume and shortest prompts).
3. Rework prompts where implementation constraints are currently implicit.
4. Expand this same baseline pattern to async-state, storage, animation, and device-permissions.

