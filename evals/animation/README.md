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
