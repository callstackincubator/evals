import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const DOUBLE_TAP_MAX_DELAY_MS = 260
const TAP_MAX_DURATION_MS = 220

export default function App() {
  const [outcome, setOutcome] = useState('Waiting for tap')
  const scale = useSharedValue(1)

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(TAP_MAX_DURATION_MS)
    .onEnd((_, success) => {
      if (!success) {
        return
      }

      scale.value = withTiming(1.02, { duration: 80 }, (finished) => {
        if (finished) {
          scale.value = withTiming(1, { duration: 120 })
        }
      })
      runOnJS(setOutcome)('Single tap action')
    })

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(DOUBLE_TAP_MAX_DELAY_MS)
    .maxDuration(TAP_MAX_DURATION_MS)
    .onEnd((_, success) => {
      if (!success) {
        return
      }

      scale.value = withTiming(1.08, { duration: 80 }, (finished) => {
        if (finished) {
          scale.value = withTiming(1, { duration: 120 })
        }
      })
      runOnJS(setOutcome)('Double tap action')
    })

  const tapGesture = Gesture.Exclusive(doubleTap, singleTap)

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  return (
    <GestureHandlerRootView style={styles.root}>
      <Text style={styles.hint}>
        Double tap wins if second tap arrives in time
      </Text>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.cardText}>Tap target</Text>
          <Text style={styles.outcome}>{outcome}</Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    width: 280,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 14,
  },
  outcome: {
    color: '#dbeafe',
    fontSize: 14,
    marginTop: 10,
  },
  root: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
})
