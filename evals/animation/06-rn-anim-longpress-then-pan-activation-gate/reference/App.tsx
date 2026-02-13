import { StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const DRAG_LIMIT = 170

function clamp(value: number, min: number, max: number) {
  'worklet'

  return Math.min(max, Math.max(min, value))
}

export default function App() {
  const translateX = useSharedValue(0)
  const dragStartX = useSharedValue(0)
  const gateProgress = useSharedValue(0)
  const isDragging = useSharedValue(0)

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      gateProgress.value = withTiming(1, { duration: 120 })
    })
    .onFinalize(() => {
      if (isDragging.value === 0) {
        gateProgress.value = withTiming(0, { duration: 120 })
      }
    })

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartX.value = translateX.value
    })
    .onUpdate((event) => {
      if (gateProgress.value < 0.99) {
        return
      }

      isDragging.value = 1
      translateX.value = clamp(
        dragStartX.value + event.translationX,
        -DRAG_LIMIT,
        DRAG_LIMIT
      )
    })
    .onFinalize(() => {
      isDragging.value = 0
      translateX.value = withTiming(0, { duration: 180 })
      gateProgress.value = withTiming(0, { duration: 120 })
    })

  const composedGesture = Gesture.Simultaneous(longPress, pan)

  const cardStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        gateProgress.value,
        [0, 1],
        ['#94a3b8', '#22c55e']
      ),
      transform: [
        { translateX: translateX.value },
        { scale: gateProgress.value === 0 ? 1 : 1.03 },
      ],
    }
  })

  const statusDotStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        gateProgress.value,
        [0, 1],
        ['#94a3b8', '#22c55e']
      ),
      opacity: gateProgress.value === 0 ? 0.5 : 1,
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.row}>
            <Animated.View style={[styles.statusDot, statusDotStyle]} />
            <Text style={styles.title}>Hold, then drag</Text>
          </View>
          <Text style={styles.subtitle}>
            Long press unlocks dragging and avoids accidental tap-drag.
          </Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    width: 260,
  },
  root: {
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statusDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 10,
  },
  title: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
  },
})
