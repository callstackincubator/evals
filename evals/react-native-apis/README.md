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

### best-practice inventory

- `API1`: define shared native styles with `StyleSheet.create(...)` instead of scattering large inline style objects across render paths
- `API2`: layer style variants with documented style composition (`[baseStyle, overrideStyle]` or `StyleSheet.compose(...)`) so overrides are explicit and deterministic
- `API3`: use built-in `StyleSheet` utilities like `absoluteFill`, `absoluteFillObject`, and `hairlineWidth` for common overlay and divider patterns instead of ad hoc duplicated constants
- `API4`: must not use `StyleSheet.setStyleAttributePreprocessor(...)` in normal app code because the docs mark it experimental and unstable
- `API5`: use static `require(...)` for bundled local images, and rely on `@2x` / `@3x` density variants instead of building dynamic image paths at runtime
- `API6`: provide explicit dimensions for network images and hybrid `uri`-based local images, because the docs do not infer size for those sources
- `API7`: use `ImageBackground` when the UI needs children layered over an image, and give it explicit size because the built-in implementation is basic and still needs dimensions
- `API8`: use `Platform.OS` or `Platform.select(...)` when only small parts of a component differ by platform, instead of splitting the whole feature too early
- `API9`: use platform-specific file extensions when platform differences are substantial enough that separate modules are clearer than branching inside one component
- `API10`: guard platform-only APIs such as `PlatformColor(...)` with platform checks or `Platform.select(...)` so unsupported names are not used on the wrong platform
- `API11`: handle text input through `onChangeText`, `onSubmitEditing`, and controlled state deliberately, and use `TextInput` refs for `.focus()` / `.blur()` when the input flow requires programmatic focus changes
- `API12`: for text-input-heavy screens, apply the documented caveats: use `onEndEditing` instead of relying on `nativeEvent.text` from `onBlur`, set `textAlignVertical: 'top'` for multiline parity, wrap multiline inputs when one-sided borders are needed, and use `KeyboardAvoidingView` / `Keyboard.dismiss()` intentionally when the keyboard must not obscure the input flow
