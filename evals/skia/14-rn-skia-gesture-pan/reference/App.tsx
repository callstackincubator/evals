import { useWindowDimensions } from 'react-native'
import { Canvas, Circle, Fill } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSharedValue, withDecay } from 'react-native-reanimated'

const RADIUS = 36

export default function App() {
  const { width, height } = useWindowDimensions()
  const cx = useSharedValue(width / 2)
  const cy = useSharedValue(height / 2)

  const gesture = Gesture.Pan()
    .onChange((e) => {
      cx.value += e.changeX
      cy.value += e.changeY
    })
    .onEnd((e) => {
      cx.value = withDecay({
        velocity: e.velocityX,
        clamp: [RADIUS, width - RADIUS],
      })
      cy.value = withDecay({
        velocity: e.velocityY,
        clamp: [RADIUS, height - RADIUS],
      })
    })

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="#0f172a" />
        <Circle cx={cx} cy={cy} r={RADIUS} color="#f472b6" />
      </Canvas>
    </GestureDetector>
  )
}
