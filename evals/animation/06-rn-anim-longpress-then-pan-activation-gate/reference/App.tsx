import { StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

export default function App() {
  const translateX = useSharedValue(0)
  const dragStartX = useSharedValue(0)

  const translateY = useSharedValue(0)
  const dragStartY = useSharedValue(0)

  const isDragging = useSharedValue(false)
  const dragStateColor = useDerivedValue(() =>
    isDragging.value ? '#22c55e' : '#94a3b8'
  )

  const pan = Gesture.Pan()
    .activateAfterLongPress(350)
    .onStart(() => {
      isDragging.value = true
      dragStartX.value = translateX.value
      dragStartY.value = translateY.value
    })
    .onUpdate((event) => {
      translateX.value = dragStartX.value + event.translationX
      translateY.value = dragStartY.value + event.translationY
    })
    .onFinalize(() => {
      isDragging.value = false
    })

  const cardStyle = useAnimatedStyle(() => {
    return {
      borderColor: dragStateColor.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        {
          scale: withTiming(isDragging.value ? 1.03 : 1, {
            duration: 120,
          }),
        },
      ],
    }
  })

  const statusDotStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: dragStateColor.value,
      opacity: withTiming(isDragging.value ? 1 : 0.5, {
        duration: 120,
      }),
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={pan}>
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
