import { Canvas, Fill } from '@shopify/react-native-skia'

const HEART_SVG =
  'M 128 96 C 128 96 80 40 32 72 C -8 96 16 160 64 192 L 128 240 L 192 192 C 240 160 264 96 224 72 C 176 40 128 96 128 96 Z'

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
    </Canvas>
  )
}
