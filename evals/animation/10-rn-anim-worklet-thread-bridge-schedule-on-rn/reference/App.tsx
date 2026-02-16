import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { scheduleOnRN } from 'react-native-worklets'
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

type BridgeScheduler<T extends unknown[]> = (
  callback: (...args: T) => void,
  ...args: T
) => void

const scheduleOnReactRuntime = scheduleOnRN as unknown as BridgeScheduler<
  [number]
>

const NEAR_ONE_EPSILON = 0.001

const INTERACTION_BAR_HEIGHT = 24
const INTERACTION_BAR_WIDTH = 260
const ANIMATION_DURATION_MILLIS = 1800
const ANIM_STEPS = 8

export default function App() {
  const [checkpointLabel, setCheckpointLabel] = useState(
    `Checkpoint: 0/${ANIM_STEPS}`
  )
  const [running, setRunning] = useState(false)

  const phase = useSharedValue(0)
  const lastPublishedBucket = useSharedValue(-1)

  const publishCheckpoint = useCallback((bucket: number) => {
    setCheckpointLabel(`Checkpoint: ${bucket}/${ANIM_STEPS}`)
  }, [])

  const uiEnergy = useDerivedValue(() => {
    'worklet'

    const eased = phase.value * phase.value * (3 - 2 * phase.value)
    return eased
  })
  useAnimatedReaction(
    () => {
      const energy = uiEnergy.value

      const biasedEnergy = energy + NEAR_ONE_EPSILON
      const clampedEnergy = Math.min(1, biasedEnergy)
      const bucketScaled = clampedEnergy * ANIM_STEPS

      return Math.floor(bucketScaled)
    },
    (nextBucket, previousBucket) => {
      if (
        nextBucket === previousBucket ||
        nextBucket === lastPublishedBucket.value
      ) {
        return
      }

      lastPublishedBucket.value = nextBucket
      scheduleOnReactRuntime(publishCheckpoint, nextBucket)
    }
  )

  const meterStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        uiEnergy.value,
        [0, 1],
        [INTERACTION_BAR_HEIGHT, INTERACTION_BAR_WIDTH]
      ),
    }
  })

  const toggleAnimation = () => {
    if (running) {
      cancelAnimation(phase)
      phase.value = 0
      lastPublishedBucket.value = -1
      setRunning(false)
      return
    }

    setRunning(true)
    phase.value = 0
    lastPublishedBucket.value = -1
    phase.value = withRepeat(
      withTiming(1, { duration: ANIMATION_DURATION_MILLIS }),
      -1,
      true
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Worklet compute + bounded bridge</Text>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, meterStyle]} />
      </View>
      <Text style={styles.caption}>{checkpointLabel}</Text>
      <Pressable onPress={toggleAnimation} style={styles.button}>
        <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    color: '#334155',
    fontSize: 14,
    marginTop: 10,
  },
  meterFill: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    height: INTERACTION_BAR_HEIGHT,
  },
  meterTrack: {
    backgroundColor: '#d1d5db',
    borderRadius: 999,
    height: INTERACTION_BAR_HEIGHT,
    marginTop: 12,
    overflow: 'hidden',
    width: INTERACTION_BAR_WIDTH,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '700',
  },
})
