# Skia eval category

React Native Skia evals — testing how well LLMs implement high-performance 2D drawing using `@shopify/react-native-skia`.

## Official docs

- Canvas overview: https://shopify.github.io/react-native-skia/docs/canvas/overview
- Painting: https://shopify.github.io/react-native-skia/docs/paint/overview
- Shapes: https://shopify.github.io/react-native-skia/docs/shapes/rect
- Path: https://shopify.github.io/react-native-skia/docs/shapes/path
- Text: https://shopify.github.io/react-native-skia/docs/text/text
- Images: https://shopify.github.io/react-native-skia/docs/images
- Image filters: https://shopify.github.io/react-native-skia/docs/image-filters/overview
- Shaders: https://shopify.github.io/react-native-skia/docs/shaders/overview
- Animations: https://shopify.github.io/react-native-skia/docs/animations/animations
- Gestures: https://shopify.github.io/react-native-skia/docs/animations/gestures

## Best-practice inventory

| #   | Rule                                                                                                                                    | Source                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Render all Skia drawing inside a `<Canvas>` root component                                                                              | canvas/overview        |
| 2   | Pass Reanimated `useSharedValue` / `useDerivedValue` directly as Skia props — no `createAnimatedComponent` or `useAnimatedProps` needed | animations/animations  |
| 3   | Use `interpolateColors` from `@shopify/react-native-skia`, not `interpolateColor` from Reanimated, for color transitions                | animations/animations  |
| 4   | Wrap gesture handlers around the `<Canvas>` using `GestureDetector`; for per-element gesture tracking, overlay an `Animated.View`       | animations/gestures    |
| 5   | Use `useCanvasSize` (JS thread) or the `onSize` shared value prop (UI thread) to read canvas dimensions reactively                      | canvas/overview        |
| 6   | Build paths imperatively with `Skia.Path.Make()` or parse SVG strings with `Skia.Path.MakeFromSVGString`                                | shapes/path            |
| 7   | Use `Paint` children on drawing elements for multiple fills/strokes; inherit paint attributes via `Group`                               | paint/overview         |
| 8   | Compose image filters by nesting `Blur`, `ColorMatrix`, etc. as children of the target drawing element or `Group`                       | image-filters/overview |
| 9   | Compile custom SKSL shaders with `Skia.RuntimeEffect.Make`; use the `Shader` component as a child of `Fill`                             | shaders/overview       |
| 10  | Capture canvas output with `makeImageSnapshot()` via `useCanvasRef`; call `encodeToBytes()` for raw pixel data                          | canvas/overview        |
| 11  | Use `matchFont` with a `fontStyle` object for system font resolution; the Text `y` origin is the text baseline, not the top             | text/text              |
| 12  | Apply blend modes at the `Group` level with the `blendMode` prop to composite child elements                                            | paint/overview         |
| 13  | Use `ClipRect` / `ClipPath` as children of a `Group` or drawing element to mask content                                                 | canvas/overview        |

## Eval traceability

| Eval                              | Primary best-practice rule(s) |
| --------------------------------- | ----------------------------- |
| 01 – canvas-fill-background       | 1, 5                          |
| 02 – shape-primitives             | 1                             |
| 03 – path-drawing                 | 6                             |
| 04 – paint-stroke-fill            | 7                             |
| 05 – linear-gradient              | 1, 2                          |
| 06 – radial-gradient              | 1, 2                          |
| 07 – image-display                | 1                             |
| 08 – text-rendering               | 11                            |
| 09 – blur-filter                  | 8                             |
| 10 – color-matrix-filter          | 8                             |
| 11 – reanimated-basic-animation   | 2                             |
| 12 – derived-value-animation      | 2                             |
| 13 – animated-color-interpolation | 3                             |
| 14 – gesture-pan                  | 4                             |
| 15 – transforms                   | 2                             |
| 16 – clip-rect-and-path           | 13                            |
| 17 – blend-mode                   | 12                            |
| 18 – svg-path-rendering           | 6                             |
| 19 – runtime-effect-shader        | 9                             |
| 20 – canvas-snapshot              | 10                            |

## Common issue clusters

| Tag             | Examples                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| API misuse      | Using `interpolateColor` from Reanimated instead of `interpolateColors` from Skia; using `createAnimatedComponent` unnecessarily |
| Setup           | Forgetting `<Canvas>` wrapper; rendering RN `<Image>` instead of Skia `<Image>`                                                  |
| Performance     | Per-render path construction instead of memoization; creating `SkPaint` objects inside render                                    |
| Platform parity | `y` origin for `Text` is baseline not top-left (differs from RN Text)                                                            |
| Edge case       | Not handling `useImage` null state before image is loaded                                                                        |
