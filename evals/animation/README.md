# animation eval research (feature-first)

## category overview

This document is the reference for the animation category eval pack under `evals/animation/`.

## library baseline and naming

- Primary animation engine: `react-native-reanimated`
- Primary gesture engine: `react-native-gesture-handler`
- Threading/worklet runtime: `react-native-worklets`
- Keyboard motion + keyboard-aware primitives: `react-native-keyboard-controller`

Note: if "react-native-keyboard-handler" is requested, this pack standardizes on `react-native-keyboard-controller`.

## best practices

### official best-practice sources

#### react-native-reanimated

- [Reanimated: getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
- [Reanimated: worklets guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets)
- [Reanimated: useSharedValue](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue)
- [Reanimated: useDerivedValue](https://docs.swmansion.com/react-native-reanimated/docs/core/useDerivedValue)
- [Reanimated: useAnimatedStyle](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle)
- [Reanimated: useAnimatedScrollHandler](https://docs.swmansion.com/react-native-reanimated/docs/scroll/useAnimatedScrollHandler)
- [Reanimated: performance guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance)
- [Reanimated: migration from 3.x to 4.x](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x)

#### react-native-gesture-handler

- [RNGH: installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/)
- [RNGH: handling gestures](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/handling-gestures/)
- [RNGH: gesture composition](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/)
- [RNGH: pan gesture](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture)
- [RNGH: troubleshooting](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/troubleshooting/)
- [RNGH: testing with Jest](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/)

#### react-native-worklets

- [Worklets: getting started](https://docs.swmansion.com/react-native-worklets/docs/)
- [Worklets: scheduleOnRN](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN)
- [Worklets: scheduleOnUI](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnUI)
- [Worklets: scheduleOnRuntime](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRuntime)
- [Worklets: runOnJS (deprecated)](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnJS)
- [Worklets: runOnUI (deprecated)](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnUI)
- [Worklets: runOnRuntime (deprecated)](https://docs.swmansion.com/react-native-worklets/docs/threading/runOnRuntime)
- [Worklets: troubleshooting](https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting/)

#### react-native-keyboard-controller

- [Keyboard Controller: docs home](https://kirillzyusko.github.io/react-native-keyboard-controller/)
- [Keyboard Controller: installation](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/installation)
- [Keyboard Controller: useReanimatedKeyboardAnimation](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-reanimated-keyboard-animation)
- [Keyboard Controller: KeyboardAwareScrollView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-aware-scroll-view)
- [Keyboard Controller: KeyboardStickyView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-sticky-view)

### best-practice inventory

- `A1`: run high-frequency animation work on the UI runtime with worklets, not React state updates.
- `A2`: keep animation state in shared values and derive styles from `useAnimatedStyle`.
- `A3`: prefer transform-based animation over layout-thrashing properties when possible.
- `A4`: clamp interpolation ranges and snap targets to deterministic bounds.
- `A5`: model gesture lifecycle explicitly (`start`, `update`, `finalize`) and keep gesture math off the JS thread.
- `A6`: compose gestures intentionally (`Race`, `Simultaneous`, `Exclusive`) instead of ad hoc responders.
- `A7`: gate drag and pan interactions with explicit activation rules (distance, long press, or fail requirements).
- `A8`: for modal interactions on Android, ensure RNGH root-view requirements are satisfied in modal boundaries.
- `A9`: separate per-frame worklet computation from occasional React-runtime side effects.
- `A10`: bridge to React runtime from worklets only through explicit worklets APIs (prefer `scheduleOnRN`; avoid deprecated `runOnJS`).
- `A11`: avoid per-frame unbounded bridge calls from worklets to React state.
- `A12`: keep dependencies version-aligned when migrating to Reanimated 4 and worklets plugin setup.
- `A13`: account for new architecture performance regressions in scroll-heavy and multi-animated-view scenarios.
- `A14`: use deterministic snap-point models for sheets and draggable surfaces.
- `A15`: keep Jest/runtime setup explicit for native gesture modules to avoid false negatives in tests.
- `A16`: drive keyboard-following UI from keyboard animation values/shared values, not ad hoc hardcoded offsets.
- `A17`: coordinate keyboard-aware scrolling and sticky footers to avoid overlap, flicker, and jump loops.
- `A18`: keep interactive keyboard dismiss and refocus transitions stable.
