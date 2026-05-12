import { useWindowDimensions } from 'react-native'
import { Canvas, Circle, Fill, Group } from '@shopify/react-native-skia'

export default function App() {
  const { width, height } = useWindowDimensions()
  const cx = width / 2
  const cy = height / 2
  const r = 100
  const offset = 60

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color='white' />
      <Group blendMode='multiply'>
        <Circle cx={cx} cy={cy - offset} r={r} color='cyan' />
        <Circle cx={cx - offset} cy={cy + offset / 2} r={r} color='magenta' />
        <Circle cx={cx + offset} cy={cy + offset / 2} r={r} color='yellow' />
      </Group>
    </Canvas>
  )
}
