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

type BridgeScheduler = (callback: (...args: unknown[]) => void, ...args: unknown[]) => void

const scheduleOnReactRuntime = scheduleOnRN as unknown as BridgeScheduler

export default function App() {
  const [checkpointLabel, setCheckpointLabel] = useState('Checkpoint: 0/8')
  const [running, setRunning] = useState(false)

  const phase = useSharedValue(0)
  const lastPublishedBucket = useSharedValue(-1)

  const publishCheckpoint = useCallback((bucket: number) => {
    setCheckpointLabel(`Checkpoint: ${bucket}/8`)
  }, [])

  const uiEnergy = useDerivedValue(() => {
    'worklet'

    const eased = phase.value * phase.value * (3 - 2 * phase.value)
    return eased
  })

  useAnimatedReaction(
    () => {
      return Math.floor(uiEnergy.value * 8)
    },
    (nextBucket, previousBucket) => {
      if (nextBucket === previousBucket || nextBucket === lastPublishedBucket.value) {
        return
      }

      lastPublishedBucket.value = nextBucket
      scheduleOnReactRuntime(publishCheckpoint, nextBucket)
    },
  )

  const meterStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(uiEnergy.value, [0, 1], [24, 260]),
    }
  })

  const toggleAnimation = () => {
    if (running) {
      cancelAnimation(phase)
      phase.value = 0
      lastPublishedBucket.value = -1
      setCheckpointLabel('Checkpoint: 0/8')
      setRunning(false)
      return
    }

    setRunning(true)
    phase.value = 0
    lastPublishedBucket.value = -1
    phase.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true)
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
    height: 24,
  },
  meterTrack: {
    backgroundColor: '#d1d5db',
    borderRadius: 999,
    height: 24,
    marginTop: 12,
    overflow: 'hidden',
    width: 260,
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
