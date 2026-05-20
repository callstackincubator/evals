import { Canvas, Fill } from '@shopify/react-native-skia'

const SIZE = 320
const COLORS = ['#06b6d4', '#8b5cf6', '#f472b6', '#06b6d4']

export default function App() {
  return (
    <Canvas
      style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}
    >
      <Fill color="#0f172a" />
    </Canvas>
  )
}
