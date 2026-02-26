# device capabilities and permissions eval research (feature-first)

## category overview

This document is the reference for the device capabilities and permissions category under `evals/device-permissions/`.

## library baseline and naming

- Expo capabilities baseline: `expo-camera`, `expo-image-picker`, `expo-location`, `expo-notifications`
- React Native community permissions baseline: `react-native-permissions`
- React Native community media baseline: `react-native-image-picker`

## best practices

### official best-practice sources

#### Expo modules

- [Expo permissions guide](https://docs.expo.dev/guides/permissions/)
- [Expo Camera docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo ImagePicker docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Location docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo push notifications setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo SDK 53 changelog](https://expo.dev/changelog/sdk-53)

#### react native community libraries

- [react-native-permissions README](https://github.com/zoontek/react-native-permissions#readme)
- [react-native-permissions releases](https://github.com/zoontek/react-native-permissions/releases)
- [react-native-image-picker README](https://github.com/react-native-image-picker/react-native-image-picker#readme)
- [react-native-image-picker releases](https://github.com/react-native-image-picker/react-native-image-picker/releases)

### best-practice inventory

- `D1`: model explicit permission states per capability (`unavailable`, `denied`, `blocked/cannot-ask-again`, `granted`, `limited/provisional` when supported).
- `D2`: separate permission `check` from `request` and avoid hidden assumptions that permission is already granted.
- `D3`: gate capability usage (camera preview, location fetch, push registration, media access) behind granted status.
- `D4`: always provide degraded UX for denied/blocked states with clear retry and settings recovery actions.
- `D5`: on Expo notifications for Android 13+, create/update notification channels before token retrieval.
- `D6`: on iOS notifications, interpret granular `ios.status` (`PROVISIONAL`, etc.) instead of only a top-level boolean.
- `D7`: for Expo location, request foreground permission before background permission.
- `D8`: for Android 11+ background location, present an explainer/rationale before settings redirection and handle partial-grant fallback.
- `D9`: for iOS location, handle `Allow Once`/in-session background denial with settings recovery and foreground-only fallback.
- `D10`: for Expo image picker on Android, recover results after activity recreation via `ImagePicker.getPendingResultAsync`.
- `D11`: for limited media access, treat partial metadata (`assetId`, file name) as optional and keep UX deterministic.
- `D12`: for Expo camera, permission-granted is not enough; handle capability checks (`isAvailableAsync`) and `onMountError` fallback.
- `D13`: for react-native-permissions, avoid Android `check`-only blocked assumptions (`request` path is required to detect some blocked outcomes).
- `D14`: for react-native-image-picker, treat `didCancel` and permission/hardware `errorCode` as expected states.
- `D15`: for legacy Android storage constraints, guard save-to-photos flows with explicit permission checks where required.
- `D16`: isolate platform/library conditionals behind adapters so UI state transitions remain deterministic.
- `D17`: model device capability checks separately from permission (for example location services enabled, physical-device-only push registration).
- `D18`: for dual-capability features (for example video recording), require all needed permissions before enabling action.
- `D19`: for iOS limited photo access, provide explicit upgrade flow (`openPhotoPicker`) while keeping limited mode usable.
- `D20`: normalize library-specific permission status models into one contract consumed by UI state machines.
