# Expo SDK eval category

## category overview

Expo SDK evals cover current SDK 56 behavior across Expo capability modules, permissions, app lifecycle, native config plugins, media APIs, system UI, updates, and SDK split/replacement APIs.

## library baseline and naming

- Baseline: Expo SDK 56 with React 19.2 and React Native 0.85 in the testbench.
- Capability packages: expo-camera, expo-image-picker, expo-location, expo-notifications, expo-file-system, expo-media-library, expo-calendar, expo-contacts, expo-audio, expo-video, expo-updates, expo-status-bar, expo-navigation-bar, expo-build-properties, expo-glass-effect.
- Eval IDs start with two digits and the `rn-expo-` prefix.

## best practices

### official best-practice sources

- Expo SDK 56 changelog: https://expo.dev/changelog/sdk-56
- Expo SDK 55 changelog: https://expo.dev/changelog/sdk-55
- Expo SDK 54 changelog: https://expo.dev/changelog/sdk-54
- Expo permissions guide: https://docs.expo.dev/guides/permissions/
- Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
- Expo ImagePicker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo FileSystem: https://docs.expo.dev/versions/latest/sdk/filesystem/
- Expo MediaLibrary: https://docs.expo.dev/versions/latest/sdk/media-library/
- Expo Calendar: https://docs.expo.dev/versions/latest/sdk/calendar/
- Expo Audio: https://docs.expo.dev/versions/latest/sdk/audio/
- Expo Video: https://docs.expo.dev/versions/latest/sdk/video/
- Expo Updates: https://docs.expo.dev/versions/latest/sdk/updates/
- Expo StatusBar: https://docs.expo.dev/versions/latest/sdk/status-bar/
- Expo NavigationBar: https://docs.expo.dev/versions/latest/sdk/navigation-bar/
- Expo BuildProperties: https://docs.expo.dev/versions/latest/sdk/build-properties/

### best-practice inventory

- E1: Request sensitive permissions only after explicit user intent.
- E2: Model denied, blocked, limited, and settings-recovery states explicitly.
- E3: Gate native views and native actions behind granted permissions and app lifecycle visibility.
- E4: Use SDK 56 replacement packages: expo-audio and expo-video instead of expo-av, expo-video thumbnails instead of expo-video-thumbnails.
- E5: Use current object/class APIs where SDK 56 root legacy methods now warn or throw, especially FileSystem, Calendar, and MediaLibrary.
- E6: Keep runtime behavior and app config aligned for notifications, media permissions, background tasks, updates, and build properties.
- E7: Treat expo-glass-effect as an Expo SDK package, gate Liquid Glass rendering with availability checks, and keep it out of @expo/ui evals.
