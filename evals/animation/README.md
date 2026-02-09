# animation eval research (feature-first)

## scope

This document is the reference for the animation category eval pack under `evals/animation/`.

## library baseline and naming

- Primary animation engine: `react-native-reanimated`
- Primary gesture engine: `react-native-gesture-handler`
- Threading/worklet runtime: `react-native-worklets`
- Keyboard motion + keyboard-aware primitives: `react-native-keyboard-controller`

Note: if "react-native-keyboard-handler" is requested, this pack currently standardizes on `react-native-keyboard-controller`, which is the actively maintained and widely adopted keyboard-motion library in the current RN ecosystem.

## official best-practice sources

### react-native-reanimated

- [Reanimated: getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
- [Reanimated: worklets guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets)
- [Reanimated: useSharedValue](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue)
- [Reanimated: useDerivedValue](https://docs.swmansion.com/react-native-reanimated/docs/core/useDerivedValue)
- [Reanimated: useAnimatedStyle](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle)
- [Reanimated: useAnimatedScrollHandler](https://docs.swmansion.com/react-native-reanimated/docs/scroll/useAnimatedScrollHandler)
- [Reanimated: performance guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance)
- [Reanimated: migration from 3.x to 4.x](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x)

### react-native-gesture-handler

- [RNGH: installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/)
- [RNGH: handling gestures](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/handling-gestures/)
- [RNGH: gesture composition](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/)
- [RNGH: pan gesture](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture)
- [RNGH: troubleshooting](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/troubleshooting/)
- [RNGH: testing with Jest](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/)

### react-native-worklets

- [Worklets: getting started](https://docs.swmansion.com/react-native-worklets/docs/)
- [Worklets: scheduleOnRN](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN)
- [Worklets: runOnRN](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnRN)
- [Worklets: runOnJS (deprecated)](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnJS)
- [Worklets: runOnUI (deprecated)](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnUI)
- [Worklets: troubleshooting](https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting/)

### react-native-keyboard-controller

- [Keyboard Controller: docs home](https://kirillzyusko.github.io/react-native-keyboard-controller/)
- [Keyboard Controller: installation](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/installation)
- [Keyboard Controller: useReanimatedKeyboardAnimation](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-reanimated-keyboard-animation)
- [Keyboard Controller: KeyboardAwareScrollView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-aware-scroll-view)
- [Keyboard Controller: KeyboardStickyView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-sticky-view)

## best-practice inventory

- `A1`: run high-frequency animation work on the UI runtime with worklets, not React state updates.
- `A2`: keep animation state in shared values and derive styles from `useAnimatedStyle`.
- `A3`: prefer transform-based animation over layout-thrashing properties when possible.
- `A4`: clamp interpolation ranges and snap targets to deterministic bounds.
- `A5`: model gesture lifecycle explicitly (`start`, `update`, `finalize`) and keep gesture math off the JS thread.
- `A6`: compose gestures intentionally (`Race`, `Simultaneous`, `Exclusive`) instead of ad hoc responders.
- `A7`: gate drag and pan interactions with explicit activation rules (distance, long press, or fail requirements).
- `A8`: for modal interactions on Android, ensure RNGH root-view requirements are satisfied in modal boundaries.
- `A9`: separate per-frame worklet computation from occasional React-runtime side effects.
- `A10`: bridge to React runtime from worklets only through explicit worklets APIs (prefer `scheduleOnRN`/`runOnRN`).
- `A11`: avoid per-frame unbounded bridge calls from worklets to React state.
- `A12`: keep dependencies version-aligned when migrating to Reanimated 4 and worklets plugin setup.
- `A13`: account for new architecture performance regressions in scroll-heavy and multi-animated-view scenarios.
- `A14`: use deterministic snap-point models for sheets and draggable surfaces.
- `A15`: keep Jest/runtime setup explicit for native gesture modules to avoid false negatives in tests.
- `A16`: drive keyboard-following UI from keyboard animation values/shared values, not ad hoc hardcoded offsets.
- `A17`: coordinate keyboard-aware scrolling and sticky footers to avoid overlap, flicker, and jump loops.
- `A18`: keep interactive keyboard dismiss and refocus transitions stable.

## issue intelligence (top recurring pain points)

These issues are used as robustness validation signals and not as prompt wording.

### setup

- [react-native-reanimated#1875](https://github.com/software-mansion/react-native-reanimated/issues/1875)
  - recurring symptom: `Failed to create a worklet`.
  - maintainer/community answer pattern: plugin placement and cache-reset correctness are mandatory.
- [react-native-reanimated#8231](https://github.com/software-mansion/react-native-reanimated/issues/8231)
  - recurring symptom: plugin migration confusion (`react-native-reanimated/plugin` vs `react-native-worklets/plugin`).
  - answer pattern: align plugin and dependency stack with Reanimated major version and dependent libs.
- [react-native-gesture-handler#2749](https://github.com/software-mansion/react-native-gesture-handler/issues/2749)
  - recurring symptom: `RNGestureHandlerModule could not be found` in tests and some setups.
  - answer pattern: configure RNGH jest/native setup and validate module wiring.
- [react-native-keyboard-controller#786](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/786)
  - recurring symptom: package appears unlinked in app runtime.
  - answer pattern: environment/setup validation plus rebuild flow.

### API misuse

- [react-native-gesture-handler#1831](https://github.com/software-mansion/react-native-gesture-handler/issues/1831)
  - recurring symptom: old gesture API warnings from direct or transitive usage.
  - answer pattern: migrate to new gestures API where feasible.
- [react-native-reanimated#8231](https://github.com/software-mansion/react-native-reanimated/issues/8231)
  - recurring symptom: removed/deprecated APIs after major upgrades.
  - answer pattern: migrate and upgrade transitive libraries.
- [react-native-gesture-handler#3266](https://github.com/software-mansion/react-native-gesture-handler/issues/3266)
  - recurring symptom: failure-chain APIs not yielding expected scroll arbitration.
  - answer pattern: make gesture precedence and fail requirements explicit.

### performance

- [react-native-reanimated#3854](https://github.com/software-mansion/react-native-reanimated/issues/3854)
  - recurring symptom: frame drops with many concurrent animated elements.
  - answer pattern: reduce per-frame workload and broad invalidation.
- [react-native-reanimated#6999](https://github.com/software-mansion/react-native-reanimated/issues/6999)
  - recurring symptom: degraded `scrollTo` under concurrent animation load.
  - answer pattern: isolate animated scope and benchmark architecture paths.
- [react-native-reanimated#7435](https://github.com/software-mansion/react-native-reanimated/issues/7435)
  - recurring symptom: Android performance regressions on new architecture.
- [react-native-keyboard-controller#871](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/871)
  - recurring symptom: keyboard-aware + list performance degradation.

### platform parity

- [react-native-gesture-handler#139](https://github.com/software-mansion/react-native-gesture-handler/issues/139)
  - recurring symptom: gestures failing inside Android modals.
  - answer pattern: modal path needs correct RNGH root-view setup.
- [react-native-reanimated#7460](https://github.com/software-mansion/react-native-reanimated/issues/7460)
  - recurring symptom: laggy scroll-linked sticky behavior on Fabric/new architecture.
- [react-native-keyboard-controller#1292](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1292)
  - recurring symptom: odd Android header/stack interaction with keyboard handling.

### edge case

- [react-native-gesture-handler#3049](https://github.com/software-mansion/react-native-gesture-handler/issues/3049)
  - recurring symptom: delayed pan activation after parent scroll.
- [react-native-keyboard-controller#867](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/867)
  - recurring symptom: sticky keyboard-follow view not moving correctly in modal contexts.
- [react-native-keyboard-controller#1110](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/1110)
  - recurring symptom: double-scroll/jump when keyboard appears with list position maintenance.

### tooling

- [react-native-reanimated#7924](https://github.com/software-mansion/react-native-reanimated/issues/7924)
  - recurring symptom: `react-native-worklets:buildCMakeDebug` failures.
- [react-native-reanimated#8217](https://github.com/software-mansion/react-native-reanimated/issues/8217)
  - recurring symptom: excessive Android CMake debug build time.
- [react-native-keyboard-controller#800](https://github.com/kirillzyusko/react-native-keyboard-controller/issues/800)
  - recurring symptom: compatibility friction during RN version transitions.

## coverage matrix (library to evals)

- `react-native-reanimated`: `01, 02, 03, 04, 05, 06, 07, 08, 10, 14, 15, 16`
- `react-native-gesture-handler`: `05, 06, 07, 08, 09, 11, 12`
- `react-native-worklets`: `10, 13`
- `react-native-keyboard-controller`: `15, 16`
- shared-values-derived-compute emphasis: `04, 10, 14, 15, 16`

## pilot animation eval set (16)

### easy (5)

1. [`01-rn-anim-pressable-scale-with-timing`](./01-rn-anim-pressable-scale-with-timing)
2. [`02-rn-anim-spring-toggle-card-height`](./02-rn-anim-spring-toggle-card-height)
3. [`03-rn-anim-layout-enter-exit-list-items`](./03-rn-anim-layout-enter-exit-list-items)
4. [`04-rn-anim-scroll-linked-collapsing-header`](./04-rn-anim-scroll-linked-collapsing-header)
5. [`11-rn-rngh-exclusive-single-double-tap`](./11-rn-rngh-exclusive-single-double-tap)

### medium (7)

6. [`05-rn-anim-pan-drag-card-with-snap-points`](./05-rn-anim-pan-drag-card-with-snap-points)
7. [`06-rn-anim-longpress-then-pan-activation-gate`](./06-rn-anim-longpress-then-pan-activation-gate)
8. [`07-rn-anim-pinch-pan-simultaneous-photo-canvas`](./07-rn-anim-pinch-pan-simultaneous-photo-canvas)
9. [`08-rn-anim-bottom-sheet-nested-scroll-handoff`](./08-rn-anim-bottom-sheet-nested-scroll-handoff)
10. [`12-rn-rngh-scroll-pan-failure-chain`](./12-rn-rngh-scroll-pan-failure-chain)
11. [`14-rn-shared-value-derived-threshold-state`](./14-rn-shared-value-derived-threshold-state)
12. [`15-rn-keyboard-controller-sticky-composer`](./15-rn-keyboard-controller-sticky-composer)

### hard (4)

13. [`09-rn-anim-android-modal-gesture-root-safety`](./09-rn-anim-android-modal-gesture-root-safety)
14. [`10-rn-anim-worklet-thread-bridge-schedule-on-rn`](./10-rn-anim-worklet-thread-bridge-schedule-on-rn)
15. [`13-rn-worklets-runtime-offload-and-bridge`](./13-rn-worklets-runtime-offload-and-bridge)
16. [`16-rn-keyboard-controller-aware-scroll-footer`](./16-rn-keyboard-controller-aware-scroll-footer)

## deterministic outcome map (new additions)

11. `11-rn-rngh-exclusive-single-double-tap`
- deterministic single vs double tap disambiguation without double-firing.
- traceability: `A5`, `A6`.

12. `12-rn-rngh-scroll-pan-failure-chain`
- deterministic axis arbitration between parent scroll and row pan gestures.
- traceability: `A6`, `A7`, issue `#3266`, `#3049`.

13. `13-rn-worklets-runtime-offload-and-bridge`
- compute offloaded from React thread; bounded bridge updates.
- traceability: `A1`, `A9`, `A10`, `A11`.

14. `14-rn-shared-value-derived-threshold-state`
- derived shared value state machine with stable threshold transitions.
- traceability: `A2`, `A4`, `A11`.

15. `15-rn-keyboard-controller-sticky-composer`
- keyboard-follow composer using keyboard animation values/shared values.
- traceability: `A16`, issue `#987`, `#1134`.

16. `16-rn-keyboard-controller-aware-scroll-footer`
- keyboard-aware scroll + sticky footer stability under show/hide/dismiss.
- traceability: `A17`, `A18`, issue `#871`, `#1110`, `#867`.

## status

- navigation category: complete at 50 evals.
- animation category: structured pilot expanded to 16 evals with explicit Reanimated + RNGH + Worklets + keyboard-controller coverage.
- current authoring phase is text-only (prompts and requirements only), with `app/` scaffolds intentionally removed.
