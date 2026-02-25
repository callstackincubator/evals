# device capabilities and permissions eval research (feature-first)

## scope

This document is the reference for the device capabilities and permissions category under `evals/device-permissions/`.

## official best-practice sources

### expo modules

- [Expo permissions guide](https://docs.expo.dev/guides/permissions/)
- [Expo Camera docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo ImagePicker docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Location docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo push notifications setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo SDK 53 changelog](https://expo.dev/changelog/sdk-53)

### react native community libraries

- [react-native-permissions README](https://github.com/zoontek/react-native-permissions#readme)
- [react-native-permissions releases](https://github.com/zoontek/react-native-permissions/releases)
- [react-native-image-picker README](https://github.com/react-native-image-picker/react-native-image-picker#readme)
- [react-native-image-picker releases](https://github.com/react-native-image-picker/react-native-image-picker/releases)

## recent api shifts to encode in eval requirements (as of 2026-02-25)

### Expo modules

- Expo ImagePicker docs mark `MediaTypeOptions` as deprecated and recommend current `mediaTypes` usage.
- Expo SDK 53 notes that push notifications are no longer supported in Expo Go on Android.
- Expo Notifications docs and setup guidance continue to require Android channel setup before token retrieval in Android 13+ registration paths.
- Expo Location docs continue to enforce foreground-before-background request sequencing, with Android 11+ background access redirected through system settings.
- Eval policy:
  - require current Expo API paths and status-based branching
  - disallow deprecated ImagePicker options (`MediaTypeOptions`)
  - require deterministic degraded paths for denied/blocked/unavailable capability states.

### react-native-permissions

- README documents Android caveats where `check`/`checkMultiple` (and notification checks) cannot fully determine blocked states without request flow.
- Latest `5.5.0` release (2025-09-27) updates one-time permission behavior documentation and tests, reinforcing request-path handling.
- Eval policy:
  - require `RESULTS`-driven state handling
  - require request-path logic for blocked detection on Android-sensitive flows.

### react-native-image-picker

- README documents response branching around `didCancel`, `errorCode`, and `assets`, and notes save-to-photos permission constraints on Android 28 and below.
- Latest releases in the `8.x` line include option-surface updates (for example restrict MIME type support), so evals should keep option handling explicit and permission-aware.
- Eval policy:
  - require explicit response-contract branching
  - require permission-aware handling for `includeExtra`/`saveToPhotos` style options with deterministic fallback UX.

## best-practice inventory

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

## issue intelligence (top recurring pain points)

These issue threads are used as robustness validation signals, not as prompt wording.

### setup

- [expo#34376](https://github.com/expo/expo/issues/34376)
  - recurring symptom: Expo Camera preview black screen in development builds.
  - answer pattern: validate native integration/build path and add capability-error fallback UX.
- [expo#37189](https://github.com/expo/expo/issues/37189)
  - recurring symptom: Expo ImagePicker behaves differently between Expo Go and production builds.
  - answer pattern: verify environment parity and treat module availability checks explicitly.
- [react-native-permissions#449](https://github.com/zoontek/react-native-permissions/issues/449)
  - recurring symptom: `No permission handler detected` setup errors.
  - answer pattern: ensure platform-specific permission handlers are configured in native setup.

### api misuse

- [expo#28756](https://github.com/expo/expo/issues/28756)
  - recurring symptom: camera permission status appears stale after request.
  - answer pattern: explicitly re-check permission state transitions and avoid stale snapshot assumptions.
- [expo#19043](https://github.com/expo/expo/issues/19043)
  - recurring symptom: notification permission request behavior on Android 13 is confusing/inconsistent.
  - answer pattern: follow Android 13 channel + permission order and branch by returned status.
- [react-native-permissions#714](https://github.com/zoontek/react-native-permissions/issues/714)
  - recurring symptom: `checkNotifications` returns unexpected `denied` mapping on Android 13.
  - answer pattern: require explicit request/status flow instead of check-only assumptions.
- [react-native-image-picker#1259](https://github.com/react-native-image-picker/react-native-image-picker/issues/1259)
  - recurring symptom: repeated permission errors when launching image picker.
  - answer pattern: handle picker response error codes as first-class UX states.

### platform parity

- [expo#20909](https://github.com/expo/expo/issues/20909)
  - recurring symptom: permissions/reporting differences for notifications across Android SDK levels.
  - answer pattern: branch platform/version behavior explicitly and avoid single-path assumptions.
- [expo#16701](https://github.com/expo/expo/issues/16701)
  - recurring symptom: location behavior differs after changing permissions in system settings.
  - answer pattern: rehydrate permission state on foreground and provide settings-return recovery.
- [react-native-image-picker#2073](https://github.com/react-native-image-picker/react-native-image-picker/issues/2073)
  - recurring symptom: Android 13 photo picker access differs from legacy gallery expectations.
  - answer pattern: adapt UX/data expectations to scoped-photo-picker constraints.

### edge case

- [expo#16749](https://github.com/expo/expo/issues/16749)
  - recurring symptom: app state interruptions cause missing picker results on Android.
  - answer pattern: recover pending picker result and merge through the normal success pipeline.
- [expo#20663](https://github.com/expo/expo/issues/20663)
  - recurring symptom: background location update paths can crash if capability assumptions are wrong.
  - answer pattern: stage permission transitions and degrade gracefully when background is denied.
- [react-native-permissions#747](https://github.com/zoontek/react-native-permissions/issues/747)
  - recurring symptom: returning from settings can restart app/session unexpectedly.
  - answer pattern: make settings recovery idempotent and re-check on app resume.
- [react-native-image-picker#1460](https://github.com/react-native-image-picker/react-native-image-picker/issues/1460)
  - recurring symptom: app restarts while opening camera/gallery in some environments.
  - answer pattern: preserve pending intent state and recover deterministically on resume.

### tooling

- [expo#28656](https://github.com/expo/expo/issues/28656)
  - recurring symptom: push notifications behavior changes with transport/provider migration paths.
  - answer pattern: keep registration and capability detection isolated from transport-specific details.
- [react-native-permissions#966](https://github.com/zoontek/react-native-permissions/issues/966)
  - recurring symptom: new Android versions can shift permission-state semantics.
  - answer pattern: centralize permission adapters and avoid hardcoded platform assumptions.
- [react-native-image-picker#2196](https://github.com/react-native-image-picker/react-native-image-picker/issues/2196)
  - recurring symptom: Android scoped-storage folder behavior changes across OS versions.
  - answer pattern: design picker flows around system photo picker constraints instead of file-path assumptions.

## coverage matrix (library to evals)

- `expo-camera`: `01, 15, 17, 16`
- `expo-image-picker`: `02, 07, 18, 16`
- `expo-location`: `03, 08, 09, 19, 16`
- `expo-notifications`: `04, 10, 11, 20, 16`
- `react-native-permissions`: `05, 12, 21, 22, 24, 16`
- `react-native-image-picker`: `06, 13, 14, 23, 16`
- cross-library orchestration and degraded UX: `16, 24`

## pilot device-capabilities eval set (24)

### easy (8)

1. [`01-rn-perm-expo-camera-request-denied-retry`](./01-rn-perm-expo-camera-request-denied-retry)
2. [`02-rn-perm-expo-image-picker-limited-library-state`](./02-rn-perm-expo-image-picker-limited-library-state)
3. [`03-rn-perm-expo-location-foreground-gate-retry`](./03-rn-perm-expo-location-foreground-gate-retry)
4. [`04-rn-perm-expo-notifications-android13-channel-order`](./04-rn-perm-expo-notifications-android13-channel-order)
5. [`05-rn-perm-rnpermissions-check-request-blocked-settings`](./05-rn-perm-rnpermissions-check-request-blocked-settings)
6. [`06-rn-perm-rn-image-picker-cancel-error-ux`](./06-rn-perm-rn-image-picker-cancel-error-ux)
7. [`17-rn-perm-expo-camera-video-mic-dual-permission`](./17-rn-perm-expo-camera-video-mic-dual-permission)
8. [`18-rn-perm-expo-image-picker-camera-unavailable-fallback`](./18-rn-perm-expo-image-picker-camera-unavailable-fallback)

### medium (10)

9. [`07-rn-perm-expo-image-picker-pending-result-recovery`](./07-rn-perm-expo-image-picker-pending-result-recovery)
10. [`08-rn-perm-expo-location-foreground-then-background-rationale`](./08-rn-perm-expo-location-foreground-then-background-rationale)
11. [`09-rn-perm-expo-location-allow-once-settings-recovery`](./09-rn-perm-expo-location-allow-once-settings-recovery)
12. [`10-rn-perm-expo-notifications-ios-provisional-status`](./10-rn-perm-expo-notifications-ios-provisional-status)
13. [`11-rn-perm-expo-notifications-settings-return-refresh`](./11-rn-perm-expo-notifications-settings-return-refresh)
14. [`12-rn-perm-rnpermissions-multi-request-sequencing`](./12-rn-perm-rnpermissions-multi-request-sequencing)
15. [`13-rn-perm-rn-image-picker-includeextra-permission-aware`](./13-rn-perm-rn-image-picker-includeextra-permission-aware)
16. [`19-rn-perm-expo-location-services-enabled-gate`](./19-rn-perm-expo-location-services-enabled-gate)
17. [`20-rn-perm-expo-notifications-physical-device-token-gate`](./20-rn-perm-expo-notifications-physical-device-token-gate)
18. [`21-rn-perm-rnpermissions-ios-limited-photo-upgrade`](./21-rn-perm-rnpermissions-ios-limited-photo-upgrade)

### hard (6)

19. [`14-rn-perm-rn-image-picker-savetophotos-legacy-android-guard`](./14-rn-perm-rn-image-picker-savetophotos-legacy-android-guard)
20. [`15-rn-perm-expo-camera-availability-mount-error-fallback`](./15-rn-perm-expo-camera-availability-mount-error-fallback)
21. [`16-rn-perm-cross-library-capability-state-machine`](./16-rn-perm-cross-library-capability-state-machine)
22. [`22-rn-perm-rnpermissions-settings-return-appstate-recheck`](./22-rn-perm-rnpermissions-settings-return-appstate-recheck)
23. [`23-rn-perm-rn-image-picker-video-permission-error-map`](./23-rn-perm-rn-image-picker-video-permission-error-map)
24. [`24-rn-perm-cross-library-status-normalization-contract`](./24-rn-perm-cross-library-status-normalization-contract)

## status

- navigation category: complete at 50 evals.
- animation category: structured pilot complete at 16 text-only evals.
- lists category: structured pilot complete at 18 text-only evals.
- device capabilities and permissions category: expanded pilot pack now includes 24 text-only evals across Expo and community permission/capability libraries.
