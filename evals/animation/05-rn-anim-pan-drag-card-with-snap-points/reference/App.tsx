/**
 * Draggable card with 2D pan and snap points.
 * Uses RNGH Gesture.Pan() (onUpdate for translation, onEnd for snap).
 * This project uses RNGH 2.x so Gesture.Pan() is used (usePanGesture is RNGH 3.x).
 *
 * Why this approach:
 * The initial approach considered only X-axis movement (translateX, 1D snap
 * points). The prompt asks for a "draggable card" and "predefined snap points"
 * without restricting to horizontal; we therefore use 2D pan (translateX +
 * translateY) and 2D snap points so the card can be dragged and snapped in all
 * directions.
 *
 * Math:
 *
 * - velocityMag = sqrt(velocityX² + velocityY²)
 *   Magnitude of the release velocity (speed in pts/s). Used to decide: if
 *   velocityMag >= VELOCITY_THRESHOLD we treat it as a fling and snap by
 *   direction; otherwise we snap to the nearest snap point by position.
 *
 * - pickSnapPointByVelocity(velocityX, velocityY)
 *   Picks the snap point most aligned with the fling direction using the dot
 *   product. For each snap point p we compute dot = p.x * velocityX + p.y * velocityY.
 *   The dot product is largest when p is in the same direction as (velocityX, velocityY).
 *   So we choose the snap point that maximizes this dot product—e.g. a fling right
 *   (velocityX > 0) tends to pick (180, 0); a fling up (velocityY < 0) tends to
 *   pick (0, -180).
 *
 * - pickNearestSnapPoint(px, py)
 *   Picks the snap point with smallest squared distance to (px, py), i.e. minimizes
 *   (px - p.x)² + (py - p.y)² (no sqrt needed for comparison).
 *
 * Changelog:
 * - Initial: X-axis only (translateX, 1D snap points [-180, 0, 180], directional
 *   snap by velocityX threshold).
 * - 2D pan: translateX + translateY; 2D snap points (center + four cardinal
 *   directions); velocityMag for fling detection; pickSnapPointByVelocity (dot
 *   product) for fling direction; pickNearestSnapPoint (squared distance) for
 *   low-velocity release.
 * - Snap animation: withSpring replaced with withTiming (simplest option).
 */
import { StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type SnapPoint = { x: number; y: number }

const SNAP_POINTS: SnapPoint[] = [
  { x: 0, y: 0 },
  { x: -180, y: 0 },
  { x: 180, y: 0 },
  { x: 0, y: -180 },
  { x: 0, y: 180 },
]
const VELOCITY_THRESHOLD = 650

function pickNearestSnapPoint(px: number, py: number): SnapPoint {
  'worklet'

  let nearest = SNAP_POINTS[0]
  let nearestDist = (px - nearest.x) ** 2 + (py - nearest.y) ** 2

  for (let i = 1; i < SNAP_POINTS.length; i += 1) {
    const p = SNAP_POINTS[i]
    const d = (px - p.x) ** 2 + (py - p.y) ** 2
    if (d < nearestDist) {
      nearest = p
      nearestDist = d
    }
  }
  return nearest
}

function pickSnapPointByVelocity(velocityX: number, velocityY: number): SnapPoint {
  'worklet'

  let best = SNAP_POINTS[0]
  let bestDot = best.x * velocityX + best.y * velocityY

  for (let i = 1; i < SNAP_POINTS.length; i += 1) {
    const p = SNAP_POINTS[i]
    const dot = p.x * velocityX + p.y * velocityY
    if (dot > bestDot) {
      best = p
      bestDot = dot
    }
  }
  return best
}

export default function App() {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const dragStartX = useSharedValue(0)
  const dragStartY = useSharedValue(0)

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartX.value = translateX.value
      dragStartY.value = translateY.value
    })
    .onUpdate((event) => {
      translateX.value = dragStartX.value + event.translationX
      translateY.value = dragStartY.value + event.translationY
    })
    .onEnd((event) => {
      const velocityMag =
        Math.sqrt(event.velocityX ** 2 + event.velocityY ** 2)
      const target =
        velocityMag >= VELOCITY_THRESHOLD
          ? pickSnapPointByVelocity(event.velocityX, event.velocityY)
          : pickNearestSnapPoint(translateX.value, translateY.value)

      translateX.value = withTiming(target.x)
      translateY.value = withTiming(target.y)
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.track}>
        <Animated.View style={[styles.card, cardStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.grabArea}>
              <Text style={styles.title}>Drag me</Text>
              <Text style={styles.subtitle}>
                Release to snap to nearest point or fling direction
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
