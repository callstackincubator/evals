# Skia eval category

React Native Skia evals — testing how well LLMs implement high-performance 2D drawing using `@shopify/react-native-skia`.

## Official docs

- Canvas overview: https://shopify.github.io/react-native-skia/docs/canvas/overview
- Painting: https://shopify.github.io/react-native-skia/docs/paint/overview
- Shapes: https://shopify.github.io/react-native-skia/docs/shapes/rect
- Path: https://shopify.github.io/react-native-skia/docs/shapes/path
- Text: https://shopify.github.io/react-native-skia/docs/text/text
- Paragraph: https://shopify.github.io/react-native-skia/docs/text/paragraph
- Group: https://shopify.github.io/react-native-skia/docs/group
- Images: https://shopify.github.io/react-native-skia/docs/images
- Image filters: https://shopify.github.io/react-native-skia/docs/image-filters/overview
- Shaders: https://shopify.github.io/react-native-skia/docs/shaders/overview
- Gradients: https://shopify.github.io/react-native-skia/docs/shaders/gradients
- Pictures: https://shopify.github.io/react-native-skia/docs/shapes/pictures
- Mask: https://shopify.github.io/react-native-skia/docs/mask
- Animations: https://shopify.github.io/react-native-skia/docs/animations/animations
- Gestures: https://shopify.github.io/react-native-skia/docs/animations/gestures
- Skottie: https://shopify.github.io/react-native-skia/docs/skottie

## Best-practice inventory

| #   | Rule                                                                                                                                      | Source                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Render all Skia drawing inside a `<Canvas>` root component                                                                                | canvas/overview        |
| 2   | Pass Reanimated `useSharedValue` / `useDerivedValue` directly as Skia props — no `createAnimatedComponent` or `useAnimatedProps` needed   | animations/animations  |
| 3   | Use `interpolateColors` from `@shopify/react-native-skia`, not `interpolateColor` from Reanimated, for color transitions                  | animations/animations  |
| 4   | Wrap gesture handlers around the `<Canvas>` using `GestureDetector`; for per-element gesture tracking, overlay an `Animated.View`         | animations/gestures    |
| 5   | Use `useCanvasSize` (JS thread) or the `onSize` shared value prop (UI thread) to read canvas dimensions reactively                        | canvas/overview        |
| 6   | Build paths imperatively with `Skia.Path.Make()` or parse SVG strings with `Skia.Path.MakeFromSVGString`                                  | shapes/path            |
| 7   | Use `Paint` children on drawing elements for multiple fills/strokes; inherit paint attributes via `Group`                                 | paint/overview         |
| 8   | Compose image filters by nesting `Blur`, `ColorMatrix`, etc. as children of the target drawing element or `Group`                         | image-filters/overview |
| 9   | Compile custom SKSL shaders with `Skia.RuntimeEffect.Make`; use the `Shader` component as a child of `Fill`                               | shaders/overview       |
| 10  | Capture canvas output with `makeImageSnapshot()` via `useCanvasRef`; call `encodeToBytes()` for raw pixel data                            | canvas/overview        |
| 11  | Use `matchFont` with a `fontStyle` object for system font resolution; the Text `y` origin is the text baseline, not the top               | text/text              |
| 12  | Apply blend modes at the `Group` level with the `blendMode` prop to composite child elements                                              | paint/overview         |
| 13  | Use `ClipRect` / `ClipPath` as children of a `Group` or drawing element to mask content                                                   | canvas/overview        |
| 14  | Use `SweepGradient` / `TwoPointConicalGradient` for angular and conical fills beyond linear/radial                                        | shaders/gradients      |
| 15  | Apply effects to a group composite with the `layer` prop (`<Paint>` + image filters), not per-child filters alone                         | group                  |
| 16  | Use `Skia.ParagraphBuilder` + `<Paragraph>` for multi-style text layouts; call `layout(width)` before rendering                           | text/paragraph         |
| 17  | Isolate imperative canvas transforms with `canvas.save()` / `canvas.restore()` inside a recorded `Picture`                                | shapes/pictures        |
| 18  | Load Lottie JSON with `Skia.Skottie.Make(JSON.stringify(...))`; drive `<Skottie>` playback with `useClock` and a Reanimated derived frame | skottie                |

## Eval traceability

| Eval                              | Primary best-practice rule(s) |
| --------------------------------- | ----------------------------- |
| 01 – canvas-fill-background       | 1, 5                          |
| 02 – shape-primitives             | 1                             |
| 03 – path-drawing                 | 6                             |
| 04 – paint-stroke-fill            | 7                             |
| 05 – linear-gradient              | 1, 2, 3                       |
| 06 – radial-gradient              | 1                             |
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
| 21 – sweep-gradient               | 14                            |
| 22 – group-layer-effect           | 15                            |
| 23 – paragraph-styled-text        | 16                            |
| 24 – picture-save-restore         | 17                            |
| 25 – lottie-playback              | 1, 2, 18                      |

## API coverage notes

The pack now covers three built-in gradient shaders (linear, radial, sweep). Major APIs still intentionally omitted — either asset-heavy, niche, or overlapping existing evals:

| API area                  | Examples                                   | Why omitted                                                                |
| ------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| Conical gradient          | `TwoPointConicalGradient`                  | Overlaps sweep/radial family; add only if conical spotlight effects matter |
| Mask compositing          | `<Mask>` with `alpha` or `luminance` mode  | Distinct from clip; good candidate if compositing pack expands             |
| Neumorphism shadows       | `Box` + `BoxShadow`, `Shadow`/`DropShadow` | UI-specific; overlaps blur/filter evals conceptually                       |
| Canvas sizing (UI thread) | `onSize` shared value prop                 | Partially covered by `useCanvasSize` in eval 01                            |
| Per-element gestures      | `Animated.View` overlay tracking           | Documented in rule 4; eval 14 only tests canvas-level pan                  |
| Nested image shaders      | `ImageShader` inside custom `Shader`       | Advanced; needs bundled image asset                                        |
| Fitbox / Group clip props | `FitBox`, `Group clip` / `invertClip`      | Overlap path/SVG evals; `FitBox` is a strong future add                    |
| Path / mask filters       | `DashPathEffect`, `BlurMask`, morphology   | Lower-level paint modifiers; narrow use cases                              |

## Common issue clusters

| Tag             | Examples                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| API misuse      | Using `interpolateColor` from Reanimated instead of `interpolateColors` from Skia; using `createAnimatedComponent` unnecessarily |
| Setup           | Forgetting `<Canvas>` wrapper; rendering RN `<Image>` instead of Skia `<Image>`                                                  |
| Performance     | Per-render path construction instead of memoization; creating `SkPaint` objects inside render                                    |
| Platform parity | `y` origin for `Text` is baseline not top-left (differs from RN Text)                                                            |
| Edge case       | Not handling `useImage` null state before image is loaded                                                                        |
