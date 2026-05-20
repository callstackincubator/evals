import {
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
} from '@shopify/react-native-skia'

const SIZE = 320
const CY = 160

export default function App() {
  return (
    <Canvas
      style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}
    >
      <Fill color="#0f172a" />
      <Group
        layer={
          <Paint>
            <Blur blur={16} />
          </Paint>
        }
      >
        <Circle cx={110} cy={CY} r={90} color={COLOR1} />
        <Circle cx={210} cy={CY} r={90} color={COLOR2} />
      </Group>
    </Canvas>
  )
}
