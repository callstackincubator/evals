import { Canvas, Fill } from '@shopify/react-native-skia'

const MIN_R = 20
const MAX_R = 100

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#1e293b" />
    </Canvas>
  )
}
