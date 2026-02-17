import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'

type BridgeScheduler = (
  callback: (...args: unknown[]) => void,
  ...args: unknown[]
) => void

const scheduleOnReactRuntime = scheduleOnRN as unknown as BridgeScheduler

const TRACK_WIDTH = 260
const KNOB_SIZE = 28

const IDLE = 0
const ACTIVE = 1
const COMMITTED = 2

const PHASE_LABELS: Record<number, string> = {
  [IDLE]: 'idle',
  [ACTIVE]: 'active',
  [COMMITTED]: 'committed',
}

const THRESHOLD_IDLE_ACTIVE = 0.3
const THRESHOLD_ACTIVE_COMMITTED = 0.75

const PHASE_COLORS = {
  trackFill: ['#94a3b8', '#f59e0b', '#16a34a'],
  knob: ['#64748b', '#d97706', '#15803d'],
  badge: ['#e2e8f0', '#fef3c7', '#dcfce7'],
}

const PHASE_INPUT_RANGE = [IDLE, ACTIVE, COMMITTED]

function clamp(value: number, min: number, max: number) {
  'worklet'

  return Math.min(max, Math.max(min, value))
}

export default function App() {
  const [phaseLabel, setPhaseLabel] = useState('idle')

  const progress = useSharedValue(0)
  const startProgress = useSharedValue(0)

  const phase = useDerivedValue(() => {
    'worklet'
    if (progress.value < THRESHOLD_IDLE_ACTIVE) {
      return IDLE
    }
    if (progress.value < THRESHOLD_ACTIVE_COMMITTED) {
      return ACTIVE
    }
    return COMMITTED
  })

  useAnimatedReaction(
    () => phase.value,
    (next, previous) => {
      'worklet'
      if (next === previous) {
        return
      }
      const label = PHASE_LABELS[next]
      scheduleOnReactRuntime(setPhaseLabel, label)
    }
  )

  const pan = Gesture.Pan()
    .onBegin(() => {
      'worklet'
      startProgress.value = progress.value
    })
    .onUpdate((event) => {
      'worklet'
      const next = startProgress.value + event.translationX / TRACK_WIDTH
      progress.value = clamp(next, 0, 1)
    })

  const trackFillStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      width: interpolate(progress.value, [0, 1], [0, TRACK_WIDTH]),
      backgroundColor: interpolateColor(
        phase.value,
        PHASE_INPUT_RANGE,
        PHASE_COLORS.trackFill
      ),
    }
  })

  const knobStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      transform: [
        {
          translateX: interpolate(
            progress.value,
            [0, 1],
            [0, TRACK_WIDTH - KNOB_SIZE]
          ),
        },
      ],
      backgroundColor: interpolateColor(
        phase.value,
        PHASE_INPUT_RANGE,
        PHASE_COLORS.knob
      ),
    }
  })

  const badgeStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      backgroundColor: interpolateColor(
        phase.value,
        PHASE_INPUT_RANGE,
        PHASE_COLORS.badge
      ),
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
