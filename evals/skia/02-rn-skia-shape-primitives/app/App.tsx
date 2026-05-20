import { Canvas, Fill } from '@shopify/react-native-skia'

const PADDING = 24
const SHAPE_SIZE = 80

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#f1f5f9" />
    </Canvas>
  )
}
