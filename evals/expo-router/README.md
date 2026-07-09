# Expo Router eval category

## category overview

Expo Router evals cover SDK 56 route-file navigation behavior, import boundaries, protected routes, native tabs, data loaders, suspense fallbacks, and not-found routing.

## library baseline and naming

- Baseline: expo-router 56.x with Expo SDK 56.
- App code should use Expo Router exports and route files. It should not duplicate generic React Navigation evals covered by the navigation category.
- Eval IDs start with two digits and the `rn-expo-router-` prefix.

## best practices

### official best-practice sources

- Expo Router SDK 55 to 56 migration: https://docs.expo.dev/router/migrate/sdk-55-to-56/
- Expo Router native tabs: https://docs.expo.dev/router/advanced/native-tabs/
- Expo Router data loaders: https://docs.expo.dev/router/web/data-loaders/
- Expo Router protected routes: https://docs.expo.dev/router/advanced/protected/
- Expo Router stack: https://docs.expo.dev/router/advanced/stack/

### best-practice inventory

- R1: In SDK 56 app code, import navigation helpers from expo-router rather than direct React Navigation packages.
- R2: Keep navigation structure in file-system routes and Expo Router layouts.
- R3: Use NativeTabs Trigger child APIs for native tabs rather than generic tab screens.
- R4: Keep search params serializable and decode missing values defensively.
- R5: Keep server/data-loader boundaries explicit and avoid client-side secret access.
- R6: Use first-class protected, suspense, and not-found route APIs instead of redirect or catch-all hacks.
