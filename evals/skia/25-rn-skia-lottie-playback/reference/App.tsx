import { useMemo } from 'react'
import {
  Canvas,
  Fill,
  Skia,
  Skottie,
  useClock,
} from '@shopify/react-native-skia'
import { useDerivedValue } from 'react-native-reanimated'

const CANVAS_SIZE = 300
const BACKGROUND_COLOR = '#0f172a'

const LOTTIE_JSON = {
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
  const animation = useMemo(
    () => Skia.Skottie.Make(JSON.stringify(LOTTIE_JSON)),
    []
  )

  const clock = useClock()
  const frame = useDerivedValue(() => {
    if (!animation) {
      return 0
    }

    const fps = animation.fps()
    const duration = animation.duration()
    return Math.floor((clock.value / 1000) * fps) % Math.floor(duration * fps)
  })

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
      {animation ? <Skottie animation={animation} frame={frame} /> : null}
    </Canvas>
  )
}
