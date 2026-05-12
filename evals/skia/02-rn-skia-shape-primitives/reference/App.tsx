import { Canvas, Circle, Fill, Line, Rect, RoundedRect, vec } from '@shopify/react-native-skia'

const PADDING = 24
const SHAPE_SIZE = 80

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color='#f1f5f9' />

      <Rect
        x={PADDING}
        y={PADDING}
        width={SHAPE_SIZE}
        height={SHAPE_SIZE}
        color='#3b82f6'
      />

      <Circle
        cx={PADDING + SHAPE_SIZE + 40 + SHAPE_SIZE / 2}
        cy={PADDING + SHAPE_SIZE / 2}
        r={SHAPE_SIZE / 2}
        color='#ef4444'
      />

      <RoundedRect
        x={PADDING}
        y={PADDING + SHAPE_SIZE + 24}
        width={SHAPE_SIZE}
        height={SHAPE_SIZE}
        r={16}
        color='#22c55e'
      />

      <Line
        p1={vec(PADDING, PADDING + (SHAPE_SIZE + 24) * 2 + 40)}
        p2={vec(PADDING + SHAPE_SIZE * 2 + 40, PADDING + (SHAPE_SIZE + 24) * 2 + 40)}
        color='#f59e0b'
        strokeWidth={4}
      />
    </Canvas>
  )
}
