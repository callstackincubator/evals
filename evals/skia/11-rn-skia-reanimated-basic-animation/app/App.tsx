import { Canvas, Fill } from '@shopify/react-native-skia'

const RADIUS = 32
const DURATION_MS = 1200

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
    </Canvas>
  )
}
