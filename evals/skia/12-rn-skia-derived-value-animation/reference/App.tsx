import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, Circle, Fill } from '@shopify/react-native-skia'
import { useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const MIN_R = 20
const MAX_R = 100
const DURATION_MS = 900

export default function App() {
  const { width, height } = useWindowDimensions()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: DURATION_MS }), -1, true)
  }, [progress])

  const r = useDerivedValue(() => MIN_R + (MAX_R - MIN_R) * progress.value)
  const cy = useDerivedValue(() => height / 2 + (MAX_R - MIN_R) * (1 - progress.value) * 0.4)

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color='#1e293b' />
      <Circle cx={width / 2} cy={cy} r={r} color='#a78bfa' />
    </Canvas>
  )
}
