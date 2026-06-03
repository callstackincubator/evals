import { Canvas, Fill } from '@shopify/react-native-skia'

const STAR_SVG =
  'M 160 30 L 190 110 L 280 110 L 210 160 L 240 240 L 160 190 L 80 240 L 110 160 L 40 110 L 130 110 Z'

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
    </Canvas>
  )
}
