# expo-sdk eval research (feature-first)

## category overview

This document is the reference for Expo SDK focused evals under `evals/expo-sdk/`.

## library baseline and naming

- Expo SDK capability modules baseline: `expo-camera`, `expo-image-picker`, `expo-location`, `expo-notifications`
- Category convention: eval IDs in this folder should start from `01-...` and stay ordered by scope complexity

## best practices

### official best-practice sources

- [Expo permissions guide](https://docs.expo.dev/guides/permissions/)
- [Expo Camera docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo ImagePicker docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Location docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo push notifications setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo SDK changelog](https://expo.dev/changelog)

### best-practice inventory

- `E1`: request capability permissions only after explicit user intent; avoid auto-requesting on first render.
- `E2`: model `undetermined`, `granted`, denied-retry, and blocked/settings-recovery states explicitly.
- `E3`: gate SDK feature rendering and actions behind confirmed granted permission.
- `E4`: refresh permission/capability state on app foreground to reflect system-settings changes.
- `E5`: provide deterministic degraded UI when permission or hardware availability blocks feature usage.
