import { Canvas, Fill, Path, Skia } from '@shopify/react-native-skia'

const STROKE_WIDTH = 4

const path = (() => {
  const p = Skia.Path.Make()
  p.moveTo(40, 300)
  p.cubicTo(100, 100, 260, 500, 340, 200)
  p.cubicTo(380, 80, 300, 400, 360, 340)
  return p
})()

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
      <Path
        path={path}
        color="#38bdf8"
        style="stroke"
        strokeWidth={STROKE_WIDTH}
        strokeCap="round"
        strokeJoin="round"
      />
    </Canvas>
  )
}
