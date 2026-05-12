import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, Circle, Fill } from '@shopify/react-native-skia'
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const RADIUS = 32
const DURATION_MS = 1200

export default function App() {
  const { width, height } = useWindowDimensions()
  const cx = useSharedValue(RADIUS)

  useEffect(() => {
    cx.value = withRepeat(
      withTiming(width - RADIUS, { duration: DURATION_MS }),
      -1,
      true
    )
  }, [cx, width])

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color='#0f172a' />
      <Circle cx={cx} cy={height / 2} r={RADIUS} color='#38bdf8' />
    </Canvas>
  )
}
