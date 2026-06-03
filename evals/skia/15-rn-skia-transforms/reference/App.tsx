import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, Circle, Fill, Group, Rect } from '@shopify/react-native-skia'
import { useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const DURATION_MS = 3000

export default function App() {
  const { width, height } = useWindowDimensions()
  const cx = width / 2
  const cy = height / 2

  const angle = useSharedValue(0)

  useEffect(() => {
    angle.value = withRepeat(withTiming(Math.PI * 2, { duration: DURATION_MS }), -1, false)
  }, [angle])

  const outerTransform = useDerivedValue(() => [
    { translateX: cx },
    { translateY: cy },
    { rotate: angle.value },
    { translateX: -cx },
    { translateY: -cy },
  ])

  const innerTransform = useDerivedValue(() => [
    { translateX: cx },
    { translateY: cy },
    { scale: 0.5 },
    { translateX: -cx },
    { translateY: -cy },
  ])

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color='#0f172a' />

      <Group transform={outerTransform}>
        <Circle cx={cx} cy={cy - 80} r={30} color='#38bdf8' />
        <Circle cx={cx} cy={cy + 80} r={30} color='#f472b6' />
        <Circle cx={cx - 80} cy={cy} r={30} color='#4ade80' />
        <Circle cx={cx + 80} cy={cy} r={30} color='#fb923c' />

        <Group transform={innerTransform}>
          <Rect
            x={cx - 20}
            y={cy - 20}
            width={40}
            height={40}
            color='#facc15'
          />
        </Group>
      </Group>
    </Canvas>
  )
}
