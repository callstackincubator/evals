import { Canvas, Fill } from '@shopify/react-native-skia'

const SIZE = 320
const BACKGROUND_COLOR = '#0f172a'
const FIRST_RECT_COLOR = '#38bdf8'
const AXIS_ALIGNED_RECT_COLOR = '#f472b6'
const THIRD_RECT_COLOR = '#4ade80'
const FIRST_RECT_ROTATION_DEG = 45
const THIRD_RECT_ROTATION_DEG = -23

export default function App() {
  return (
    <Canvas
      style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}
    >
      <Fill color={BACKGROUND_COLOR} />
    </Canvas>
  )
}
