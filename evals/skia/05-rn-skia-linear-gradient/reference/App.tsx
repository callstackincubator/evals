import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, Fill, LinearGradient, interpolateColors, vec } from '@shopify/react-native-skia'
import { useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const START_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981']
const END_COLORS = ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

const INPUT_RANGE = START_COLORS.map((_, i) => i)

export default function App() {
  const { width, height } = useWindowDimensions()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(START_COLORS.length - 1, { duration: 3000 }),
      -1,
      true
    )
  }, [progress])

  const colors = useDerivedValue(() => [
    interpolateColors(progress.value, INPUT_RANGE, START_COLORS),
    interpolateColors(progress.value, INPUT_RANGE, END_COLORS),
  ])

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={colors}
        />
      </Fill>
    </Canvas>
  )
}
