import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

const MAX_SCALE = 3
const MIN_SCALE = 1
const VIEWPORT_SIZE = 280

function clamp(value: number, min: number, max: number) {
  'worklet'

  return Math.min(max, Math.max(min, value))
}

function maxOffsetForScale(scale: number) {
  'worklet'

  return ((VIEWPORT_SIZE * scale) - VIEWPORT_SIZE) / 2
}

export default function App() {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  const pan = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate((event) => {
      const maxOffset = Math.max(0, maxOffsetForScale(scale.value))
      translateX.value = clamp(savedTranslateX.value + event.translationX, -maxOffset, maxOffset)
      translateY.value = clamp(savedTranslateY.value + event.translationY, -maxOffset, maxOffset)
    })

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value
    })
    .onUpdate((event) => {
      const nextScale = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE)
      scale.value = nextScale

      const maxOffset = Math.max(0, maxOffsetForScale(nextScale))
      translateX.value = clamp(translateX.value, -maxOffset, maxOffset)
      translateY.value = clamp(translateY.value, -maxOffset, maxOffset)
    })

  const gesture = Gesture.Simultaneous(pinch, pan)

  const photoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <Text style={styles.title}>Pinch + pan photo canvas</Text>
      <View style={styles.viewport}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.photo, photoStyle]}>
            <Text style={styles.caption}>Zoom and drag me</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  photo: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 18,
    height: VIEWPORT_SIZE,
    justifyContent: 'center',
    width: VIEWPORT_SIZE,
  },
  root: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  viewport: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    height: VIEWPORT_SIZE,
    overflow: 'hidden',
    width: VIEWPORT_SIZE,
  },
})
