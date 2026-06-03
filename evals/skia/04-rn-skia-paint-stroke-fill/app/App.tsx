import { Canvas, Fill } from '@shopify/react-native-skia'

const SIZE = 300

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
    </Canvas>
  )
}
