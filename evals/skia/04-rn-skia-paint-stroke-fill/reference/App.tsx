import { Canvas, Circle, Fill, Group, Paint, Rect, vec } from '@shopify/react-native-skia'

const SIZE = 300
const CX = SIZE / 2
const R = 100
const OUTER_STROKE = 16
const INNER_STROKE = 8

export default function App() {
  return (
    <Canvas style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}>
      <Fill color='#0f172a' />

      <Circle cx={CX} cy={CX} r={R} color='#6366f1'>
        <Paint color='#a5b4fc' />
        <Paint color='#818cf8' style='stroke' strokeWidth={OUTER_STROKE} />
        <Paint color='#c7d2fe' style='stroke' strokeWidth={INNER_STROKE} />
      </Circle>

      <Group color='#fbbf24'>
        <Rect x={20} y={20} width={40} height={40} />
        <Group style='stroke' strokeWidth={3}>
          <Rect x={70} y={20} width={40} height={40} />
        </Group>
      </Group>
    </Canvas>
  )
}
