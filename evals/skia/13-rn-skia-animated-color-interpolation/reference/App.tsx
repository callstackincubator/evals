import { useEffect } from 'react'
import { Canvas, Fill, interpolateColors } from '@shopify/react-native-skia'
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#6366f1']
const INPUT_RANGE = COLORS.map((_, i) => i)
const DURATION_MS = 2000

export default function App() {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(COLORS.length - 1, { duration: DURATION_MS }),
      -1,
      false
    )
  }, [progress])

  const color = useDerivedValue(() =>
    interpolateColors(progress.value, INPUT_RANGE, COLORS)
  )

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color={color} />
    </Canvas>
  )
}
