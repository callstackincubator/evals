import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  createWorkletRuntime,
  scheduleOnRN,
  scheduleOnRuntime,
} from 'react-native-worklets'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type RuntimeHandle = unknown
type RuntimeFactory = (name: string) => RuntimeHandle
type RuntimeScheduler = (
  runtime: RuntimeHandle,
  worker: (...args: unknown[]) => void,
  ...args: unknown[]
) => void

type BatchPayload = {
  batchIndex: number
  totalBatches: number
  score: number
}

const buildRuntime = createWorkletRuntime as unknown as RuntimeFactory

const TOTAL_BATCHES = 20
const BATCH_SIZE = 3000
const BRIDGE_EVERY_N_BATCHES = 4

const runtime = buildRuntime('analysis-runtime')

export default function App() {
  const [status, setStatus] = useState('Idle')
  const [lastScore, setLastScore] = useState(0)
  const progress = useSharedValue(0)

  const commitBatch = (payload: BatchPayload) => {
    setLastScore(payload.score)
    setStatus(`Processed batch ${payload.batchIndex}/${payload.totalBatches}`)
    progress.value = withTiming(payload.batchIndex / payload.totalBatches, {
      duration: 140,
    })
  }

  const runHeavyComputation = () => {
    setStatus('Running offloaded compute')
    setLastScore(0)
    progress.value = withTiming(0, { duration: 80 })

    const worker = (currentBatch: number, totalBatches: number) => {
      'worklet'

      let accumulator = 0

      const start = (currentBatch - 1) * BATCH_SIZE
      const end = start + BATCH_SIZE

      for (let i = start; i < end; i += 1) {
        accumulator += Math.sqrt((i % 200) + 1) * Math.sin(i / 7)
      }

      const compactScore = Math.round(Math.abs(accumulator))
      const isScheduledBridgePoint =
        currentBatch % BRIDGE_EVERY_N_BATCHES === 0 ||
        currentBatch === totalBatches
      if (isScheduledBridgePoint) {
        scheduleOnRN(commitBatch, {
          batchIndex: currentBatch,
          totalBatches,
          score: compactScore,
        })
      }
    }

    for (let batchIndex = 1; batchIndex <= TOTAL_BATCHES; batchIndex += 1) {
      scheduleOnRuntime(runtime, worker, batchIndex, TOTAL_BATCHES)
    }
  }

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.round(progress.value * 100)}%`,
    }
  })

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Offload compute to worklets runtime</Text>
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.score}>Last compact score: {lastScore}</Text>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, progressStyle]} />
      </View>

      <Pressable onPress={runHeavyComputation} style={styles.button}>
        <Text style={styles.buttonText}>Run compute</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f766e',
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
  fill: {
    backgroundColor: '#14b8a6',
    borderRadius: 999,
    height: '100%',
  },
  score: {
    color: '#334155',
    fontSize: 14,
    marginTop: 4,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  status: {
    color: '#0f172a',
    fontSize: 15,
    marginTop: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  track: {
    backgroundColor: '#99f6e4',
    borderRadius: 999,
    height: 16,
    marginTop: 14,
    overflow: 'hidden',
    width: 260,
  },
})
