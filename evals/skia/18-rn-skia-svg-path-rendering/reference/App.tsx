import { Canvas, Fill, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia'

const HEART_SVG =
  'M 128 96 C 128 96 80 40 32 72 C -8 96 16 160 64 192 L 128 240 L 192 192 C 240 160 264 96 224 72 C 176 40 128 96 128 96 Z'

const heartPath = Skia.Path.MakeFromSVGString(HEART_SVG)!

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color='#0f172a' />

      <Path path={heartPath} color='transparent'>
        <LinearGradient
          start={vec(32, 40)}
          end={vec(224, 240)}
          colors={['#f472b6', '#ef4444']}
        />
      </Path>

      <Path
        path={heartPath}
        color='#fda4af'
        style='stroke'
        strokeWidth={3}
        strokeJoin='round'
      />
    </Canvas>
  )
}
