# react-native-apis eval research (feature-first)

## category overview

This document is the reference for the React Native built-in APIs category eval pack under `evals/react-native-apis/`.

This category is scoped to built-in React Native APIs that appear frequently in day-to-day app code and have clear, documentation-backed implementation expectations: `StyleSheet`, image handling, platform-specific code, and text input handling.

## library baseline and naming

- Core styling baseline: `StyleSheet` from `react-native`
- Core image baseline: `Image` and `ImageBackground` from `react-native`
- Core platform baseline: `Platform` and platform-specific file extensions (`.ios`, `.android`, `.native`)
- Core text input baseline: `TextInput`, `KeyboardAvoidingView`, and `Keyboard` from `react-native`
- Current documentation baseline for this research pass: React Native `0.84`
- Naming convention: standardize on `StyleSheet`, `Image`, `ImageBackground`, `Platform`, `TextInput`, `KeyboardAvoidingView`, and `Keyboard` in prompts, requirements, and reference implementations
- Eval ID convention: use subgroup prefixes `rn-stylesheet-*`, `rn-image-*`, `rn-platform-*`, and `rn-textinput-*`

## best practices

### official best-practice sources

#### StyleSheet

- [React Native: StyleSheet](https://reactnative.dev/docs/stylesheet)
- [React Native: Style](https://reactnative.dev/docs/style)

#### Image

- [React Native: Images](https://reactnative.dev/docs/images)
- [React Native: ImageBackground](https://reactnative.dev/docs/imagebackground)

#### Platform-specific code

- [React Native: Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [React Native: Platform](https://reactnative.dev/docs/platform)
- [React Native: PlatformColor](https://reactnative.dev/docs/platformcolor)

#### Text input handling

- [React Native: Handling Text Input](https://reactnative.dev/docs/handling-text-input)
- [React Native: TextInput](https://reactnative.dev/docs/textinput)
- [React Native: KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview)
- [React Native: Keyboard](https://reactnative.dev/docs/keyboard)
