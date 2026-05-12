import { Canvas, Circle, Fill, RadialGradient, vec } from '@shopify/react-native-skia'

const SIZE = 320
const CX = SIZE / 2
const CY = SIZE / 2
const R = 120

export default function App() {
  return (
    <Canvas style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}>
      <Fill color='#0f172a' />
      <Circle cx={CX} cy={CY} r={R}>
        <RadialGradient
          c={vec(CX, CY)}
          r={R}
          colors={['#facc15', '#f97316', 'transparent']}
        />
      </Circle>
    </Canvas>
  )
}
