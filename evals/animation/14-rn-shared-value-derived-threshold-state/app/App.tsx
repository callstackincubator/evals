import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'

const TRACK_WIDTH = 260
const KNOB_SIZE = 28

const IDLE = 0
const ACTIVE = 1
const COMMITTED = 2

function clamp(value: number, min: number, max: number) {
  'worklet'

  return Math.min(max, Math.max(min, value))
}

function labelForState(phase: number) {
  if (phase === IDLE) {
    return 'idle'
  }
  if (phase === ACTIVE) {
    return 'active'
  }
  return 'committed'
}

export default function App() {
  const [phaseLabel, setPhaseLabel] = useState('idle')

  const progress = useSharedValue(0)
  const startProgress = useSharedValue(0)

  const phase = useDerivedValue(() => {
    if (progress.value < 0.3) {
      return IDLE
    }
    if (progress.value < 0.75) {
      return ACTIVE
    }
    return COMMITTED
  })

  useAnimatedReaction(
    () => phase.value,
    (next, previous) => {
      if (next === previous) {
        return
      }
      runOnJS(setPhaseLabel)(labelForState(next))
    },
  )

  const pan = Gesture.Pan()
    .onBegin(() => {
      startProgress.value = progress.value
    })
    .onUpdate((event) => {
      const next = startProgress.value + event.translationX / TRACK_WIDTH
      progress.value = clamp(next, 0, 1)
    })

  const trackFillStyle = useAnimatedStyle(() => {
    return {
      width: progress.value * TRACK_WIDTH,
      backgroundColor: interpolateColor(phase.value, [IDLE, ACTIVE, COMMITTED], ['#94a3b8', '#f59e0b', '#16a34a']),
    }
  })

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: progress.value * (TRACK_WIDTH - KNOB_SIZE) }],
      backgroundColor: interpolateColor(phase.value, [IDLE, ACTIVE, COMMITTED], ['#64748b', '#d97706', '#15803d']),
    }
  })

  const badgeStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(phase.value, [IDLE, ACTIVE, COMMITTED], ['#e2e8f0', '#fef3c7', '#dcfce7']),
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <Text style={styles.title}>Derived threshold state machine</Text>
      <Animated.View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>Phase: {phaseLabel}</Text>
      </Animated.View>

      <View style={styles.trackShell}>
        <Animated.View style={[styles.fill, trackFillStyle]} />
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.knob, knobStyle]} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  fill: {
    borderRadius: 999,
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  knob: {
    borderRadius: 999,
    height: KNOB_SIZE,
    left: 0,
    position: 'absolute',
    top: (36 - KNOB_SIZE) / 2,
    width: KNOB_SIZE,
  },
  root: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
  trackShell: {
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    height: 36,
    overflow: 'visible',
    width: TRACK_WIDTH,
  },
})
