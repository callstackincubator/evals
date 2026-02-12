import { StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const SNAP_POINTS = [-180, 0, 180]
const VELOCITY_THRESHOLD = 650

function pickNearestSnapPoint(position: number) {
  'worklet'

  let nearest = SNAP_POINTS[0]
  let nearestDistance = Math.abs(position - nearest)

  for (let index = 1; index < SNAP_POINTS.length; index += 1) {
    const point = SNAP_POINTS[index]
    const distance = Math.abs(position - point)
    if (distance < nearestDistance) {
      nearest = point
      nearestDistance = distance
    }
  }

  return nearest
}

function pickDirectionalSnapPoint(position: number, direction: -1 | 1) {
  'worklet'

  const nearest = pickNearestSnapPoint(position)
  const nearestIndex = SNAP_POINTS.indexOf(nearest)
  const nextIndex = Math.min(
    SNAP_POINTS.length - 1,
    Math.max(0, nearestIndex + direction)
  )

  return SNAP_POINTS[nextIndex]
}

export default function App() {
  const translateX = useSharedValue(0)
  const dragStartX = useSharedValue(0)

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartX.value = translateX.value
    })
    .onUpdate((event) => {
      translateX.value = dragStartX.value + event.translationX
    })
    .onEnd((event) => {
      let target = pickNearestSnapPoint(translateX.value)

      if (event.velocityX > VELOCITY_THRESHOLD) {
        target = pickDirectionalSnapPoint(translateX.value, 1)
      } else if (event.velocityX < -VELOCITY_THRESHOLD) {
        target = pickDirectionalSnapPoint(translateX.value, -1)
      }

      translateX.value = withSpring(target, {
        damping: 16,
        stiffness: 180,
      })
    })

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.track}>
        <Animated.View style={[styles.card, cardStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.grabArea}>
              <Text style={styles.title}>Drag me horizontally</Text>
              <Text style={styles.subtitle}>
                Release to snap to -180, 0, or 180
              </Text>
            </View>
          </GestureDetector>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: 220,
  },
  grabArea: {
    minHeight: 140,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  root: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: 14,
    marginTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  track: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
