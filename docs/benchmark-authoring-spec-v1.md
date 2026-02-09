# benchmark authoring spec v1

This document is the baseline for creating and reviewing React Native evals at scale.

## objectives

- standardize task authoring so quality stays consistent across categories
- keep `requirements.yaml` checks as the primary signal, with optional deterministic unit checks
- make every task independently reviewable, reproducible, and aligned with real developer feature requests

## category research workflow (required)

Use this workflow for every category before writing tasks.

1. **read official docs first**

- collect core APIs, recommended patterns, and explicit caveats
- capture links to source sections used for task design

2. **extract best-practice rules**

- turn docs into a concise list of do/don't implementation rules
- keep rules concrete enough to assert in requirement checks (and unit tests when present)

3. **derive feature asks from best practices**

- write prompts as requests a regular developer would make
- avoid bug-report language in prompt text
- map each prompt to one primary best-practice rule

4. **define deterministic checks**

- express expected user-visible outcomes as deterministic assertions
- add minimal atomic requirement checks that enforce the target best practice

5. **mine common issues (secondary validation)**

- inspect top GitHub issues/discussions for main libraries in the category
- prioritize issues with high reactions, repeated duplicates, or recurring regressions
- tag each issue as: setup, API misuse, performance, platform parity, edge case, or tooling
- use issue clusters to stress-test coverage, not to define prompt language

6. **apply best-practice checks**

- verify task enforces recommended usage patterns from docs
- verify task avoids anti-patterns commonly seen in issue threads

## recommended categories and outlines

### 1) ui interaction and animation

**What this group should test**

- smooth interactive motion under realistic UI updates
- correct gesture-to-animation behavior and interruptibility
- proper animation primitives for layout vs transform changes

**Popular libraries**

- `react-native-reanimated`
- `react-native-gesture-handler`
- `@shopify/react-native-skia`

**Common pain points to benchmark**

- jank from JS-thread-bound animations during heavy renders
- incorrect shared value lifecycles and stale closures
- gesture conflicts between nested handlers
- platform differences in animation timing and easing

**Best practices to enforce**

- use UI-thread-capable animation paths for high-frequency interactions
- avoid animating layout properties when transform alternatives exist
- separate gesture state from render-heavy React state
- keep animation tasks measurable via deterministic UI assertions

### 2) navigation and screen lifecycle

**What this group should test**

- route transitions, params, nested navigator behavior, back semantics
- lifecycle correctness on focus/blur/remount paths

**Popular libraries**

- `@react-navigation/native`
- `react-native-screens`
- `react-native-safe-area-context`

**Common pain points to benchmark**

- stale params and incorrect state restoration
- Android back behavior mismatch in nested navigators
- memory/perf regressions from over-mounted screens
- race conditions when async effects run on focus transitions

**Best practices to enforce**

- model navigation as explicit state transitions with testable outcomes
- verify back behavior on Android-specific paths
- use focus-aware effects and cleanup on screen blur/unmount
- validate deep-link and param handling for invalid inputs

### 3) forms and input workflows

**What this group should test**

- input capture, validation, submission lifecycle, error feedback
- keyboard and focus behavior under multi-field workflows

**Popular libraries**

- `react-hook-form`
- `formik`
- `zod`
- `yup`
- `react-native-keyboard-aware-scroll-view`

**Common pain points to benchmark**

- uncontrolled/controlled mismatch and stale validation state
- async validation races and double-submit bugs
- keyboard overlap causing inaccessible fields/actions
- invalid error messaging and missing touched/dirty semantics

**Best practices to enforce**

- schema-driven validation with deterministic rules
- explicit submit states (`idle/loading/success/error`)
- prevent duplicate submissions during pending requests
- ensure focus order and error visibility are testable

### 4) data fetching and async state

**What this group should test**

- loading, error, empty, success states and transitions
- retry, cancellation, and stale response handling

**Popular libraries**

- `@tanstack/react-query`
- `swr`
- `axios`
- `ky`
- `zustand` (for async orchestration in app state)

**Common pain points to benchmark**

- race conditions where old responses overwrite new intent
- infinite refetch loops from unstable query keys/effects
- retry behavior that hides permanent failures
- optimistic UI not rolled back correctly on error

**Best practices to enforce**

- explicit state machine for fetch lifecycle
- stable cache/query keys and deterministic invalidation
- cancellable requests on navigation/unmount
- deterministic fixtures for network behavior in tests

### 5) lists and performance-sensitive rendering

**What this group should test**

- large-list rendering correctness and responsiveness
- item update behavior and virtualization boundaries

**Popular libraries**

- core `FlatList` / `SectionList`
- `@shopify/flash-list`
- `legend-list`

**Common pain points to benchmark**

- dropped frames from expensive row renders
- broken keys causing row reuse artifacts
- incorrect pagination windowing and repeated fetch triggers
- scroll position reset/regression after state updates

**Best practices to enforce**

- stable `keyExtractor` and predictable item identity
- memoized row components where needed
- verify pagination triggers and end-reached behavior deterministically
- include perf-oriented constraints without flaky timing assertions

### 6) accessibility and inclusive UX

**What this group should test**

- semantic labeling, roles/states, focus management, live announcements
- cross-platform accessibility parity for critical controls

**Popular libraries / APIs**

- core RN accessibility props (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`, etc.)
- `AccessibilityInfo`
- `react-native-a11y`
- `@react-native-aria/*`

**Common pain points to benchmark**

- missing labels/roles on interactive elements
- incorrect state announcements for toggles/progress
- broken focus order in modals and dynamic sections
- inaccessible error messaging and status updates

**Best practices to enforce**

- every interactive control has explicit semantic metadata
- focus and announcements are validated on state changes
- avoid relying on visual-only cues for status/errors
- test with deterministic accessibility assertions, not style heuristics

### 7) device capabilities and permissions

**What this group should test**

- permission request/denial/retry flows and degraded UX paths
- integration correctness for camera, media, location, notifications

**Popular libraries**

- `expo-camera`
- `expo-image-picker`
- `expo-location`
- `expo-notifications`
- `react-native-permissions`
- `react-native-image-picker`

**Common pain points to benchmark**

- permission edge cases (denied forever, limited access, revoked)
- platform-specific API behavior drift
- crashing on unavailable hardware/capabilities
- missing fallback UX when access is unavailable

**Best practices to enforce**

- model explicit permission state transitions
- always provide graceful fallback and recovery actions
- isolate platform conditionals behind tested helpers
- avoid hidden assumptions about granted permissions

### 8) offline, storage, and sync resilience

**What this group should test**

- local persistence correctness and rehydration behavior
- offline-first user actions and later reconciliation/sync

**Popular libraries**

- `@react-native-async-storage/async-storage`
- `react-native-mmkv`
- `expo-sqlite`
- `watermelondb`
- `realm`
- `redux-persist`

**Common pain points to benchmark**

- corrupted or partial rehydration after app restart
- stale cache shown as fresh without invalidation signals
- conflict resolution bugs on reconnect
- data loss from non-atomic writes or incorrect migrations

**Best practices to enforce**

- define source-of-truth and merge strategy per entity
- separate persisted data model from transient UI model
- include migration/versioning checks for stored schema
- verify offline actions queue and replay deterministically

## target distribution

Use this default mix per category:

- easy: 20
- medium: 20
- hard: 10

Total: 50 tasks per category.

## task contract (required)

Each task must include:

- `prompt.md` with one clear objective and explicit constraints
- `app/` scaffold with `App.base.tsx` starter state
- `requirements.yaml` with 2-5 atomic requirement checks for llm-judge
- optional `eval.test.ts` only when deterministic unit coverage adds unique value

## review checklist (must pass)

1. **clarity**: prompt is specific and has no ambiguity about success criteria
2. **determinism**: requirement checks are stable across repeated judge runs
3. **baseline fail**: starter app fails required checks
4. **reference pass**: known-good implementation passes
5. **runner integrity**: outputs are generated in `runs/` and aggregated in `results/`
6. **pain-point traceability**: task links back to at least one documented pain point

## execution workflow for batch creation

1. create 10 pilot tasks per category using the category workflow above
2. run pilot across selected models and identify flaky/ambiguous tasks
3. fix or remove weak tasks
4. scale to 50 tasks per category with same review gate
5. freeze benchmark version and publish changelog

## versioning

- maintain category/task manifests by benchmark version (`v1`, `v2`, ...)
- any task edits after release require version bump and changelog entry
- never silently change existing released tasks

## research basis for this spec

- React Native docs: performance, animations, accessibility
- React Navigation docs: lifecycle and back behavior patterns
- Expo docs: animation and mobile workflow guidance
- coding benchmark practice (SWE-bench, LiveCodeBench, BigCodeBench, Aider): deterministic evaluation, reproducibility, and explicit scoring contracts
