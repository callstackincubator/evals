# Expo UI eval category

## category overview

Expo UI evals cover SDK 56 @expo/ui universal components, community drop-in replacements, native state, and platform-specific SwiftUI/Jetpack Compose entrypoints.

## library baseline and naming

- Baseline: @expo/ui 56.x.
- Universal components import from @expo/ui.
- Drop-in community replacements import from @expo/ui/community/*.
- SwiftUI and Jetpack Compose APIs import from @expo/ui/swift-ui and @expo/ui/jetpack-compose.
- expo-glass-effect is covered under expo-sdk, not this category.

## best practices

### official best-practice sources

- Expo UI overview: https://docs.expo.dev/versions/latest/sdk/ui/
- Expo UI universal: https://docs.expo.dev/versions/latest/sdk/ui/universal/
- Expo UI SwiftUI: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/
- Expo UI Jetpack Compose: https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/
- Expo SDK 56 changelog: https://expo.dev/changelog/sdk-56

### best-practice inventory

- U1: Render universal Expo UI native controls under Host.
- U2: Import drop-in replacements from @expo/ui/community/* rather than legacy community packages.
- U3: Keep native component values controlled and handle platform differences explicitly.
- U4: Use useNativeState for native-shared state when required, and clean up listeners.
- U5: Keep platform-specific modifiers and components isolated by platform entrypoint.
- U6: Do not treat expo-glass-effect as part of @expo/ui.
