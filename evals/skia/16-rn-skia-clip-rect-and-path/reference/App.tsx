import {
  Canvas,
  Fill,
  Group,
  LinearGradient,
  Rect,
  Skia,
  rect,
  vec,
} from '@shopify/react-native-skia'

const STAR_SVG =
  'M 160 30 L 190 110 L 280 110 L 210 160 L 240 240 L 160 190 L 80 240 L 110 160 L 40 110 L 130 110 Z'
const starPath = Skia.Path.MakeFromSVGString(STAR_SVG)!

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />

      {/* Clip a gradient to a rectangular region via Group's clip prop */}
      <Group clip={rect(20, 60, 200, 140)}>
        <Rect x={0} y={0} width={320} height={320} color="transparent">
          <LinearGradient
            start={vec(0, 60)}
            end={vec(320, 200)}
            colors={['#6366f1', '#ec4899', '#f59e0b']}
          />
        </Rect>
      </Group>

      {/* Clip a solid block to a star shape via Group's clip prop */}
      <Group clip={starPath}>
        <Rect x={0} y={240} width={320} height={320} color="#38bdf8" />
      </Group>
    </Canvas>
  )
}
