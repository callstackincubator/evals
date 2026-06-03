import {
  Canvas,
  Circle,
  Fill,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia'

const SIZE = 320
const CX = SIZE / 2
const CY = SIZE / 2
const R = 120
const COLORS = ['#06b6d4', '#8b5cf6', '#f472b6', '#06b6d4']

export default function App() {
  return (
    <Canvas
      style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}
    >
      <Fill color="#0f172a" />
      <Circle cx={CX} cy={CY} r={R}>
        <SweepGradient c={vec(CX, CY)} colors={COLORS} />
      </Circle>
    </Canvas>
  )
}
