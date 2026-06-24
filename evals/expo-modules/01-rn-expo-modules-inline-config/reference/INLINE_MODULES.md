# Inline Modules

Changing `expo.experiments.inlineModules` or its `watchedDirectories` requires regenerating the native project with `npx expo prebuild` or rebuilding the development client so the generated module providers include the inline module.
