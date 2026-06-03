import { Canvas, Fill } from '@shopify/react-native-skia'

const STROKE_WIDTH = 4

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
    </Canvas>
  )
}
