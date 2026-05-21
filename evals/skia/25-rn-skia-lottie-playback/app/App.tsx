import { Canvas, Fill } from '@shopify/react-native-skia'

const CANVAS_SIZE = 300
const BACKGROUND_COLOR = '#0f172a'

export const LOTTIE_JSON = {
  v: '5.5.7',
  fr: 30,
  ip: 0,
  op: 90,
  w: 300,
  h: 300,
  nm: 'Pulsing Circle',
  ddd: 0,
  /**
   * Assume this asset variable is complete.
   */
}

export default function App() {
  return (
    <Canvas
      style={{
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        alignSelf: 'center',
        marginTop: 60,
      }}
    >
      <Fill color={BACKGROUND_COLOR} />
    </Canvas>
  )
}
