# Expo Modules eval category

## category overview

Expo Modules evals are statically judged file tasks covering inline modules, native module naming, JS wrappers, config plugins, type generation, and module scaffolding.

## library baseline and naming

- Baseline: Expo SDK 56 Expo Modules API.
- Inline modules are SDK 56 experimental behavior and are judged from app config plus Kotlin/Swift files.
- Eval IDs start with two digits and the `rn-expo-modules-` prefix.

## best practices

### official best-practice sources

- Expo Modules API overview: https://docs.expo.dev/modules/overview/
- Expo Modules API reference: https://docs.expo.dev/modules/module-api/
- Inline modules reference: https://docs.expo.dev/modules/inline-modules-reference/
- Type generation reference: https://docs.expo.dev/modules/typescript/
- expo-module.config.json reference: https://docs.expo.dev/modules/module-config/
- Config plugins introduction: https://docs.expo.dev/config-plugins/introduction/

### best-practice inventory

- M1: Enable inline modules through expo.experiments.inlineModules and valid watchedDirectories.
- M2: Keep inline module file names, class names, and module names aligned.
- M3: Wrap native modules from JS with requireNativeModule or requireNativeViewManager and typed helpers.
- M4: Declare native view props/events in both native module definitions and JS wrappers.
- M5: Keep type generation output stable and committed when it is part of the public surface.
- M6: Write config plugins through Expo config-plugin mods and make permission changes idempotent.
