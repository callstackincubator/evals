# Inline Modules

Native modules under `src/` are written with the Expo Modules Kotlin/Swift DSL so
they can be picked up as inline modules without publishing a separate package.

Changes to the inline module configuration require regenerating the native project
(`npx expo prebuild`) or rebuilding the development client so the generated module
providers include the inline module.
