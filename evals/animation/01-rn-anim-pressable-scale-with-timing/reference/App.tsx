import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const PRESS_IN_CONFIG = { duration: 120 }
const PRESS_OUT_CONFIG = { duration: 140 }
const PRESSED_SCALE = 0.94
const REST_SCALE = 1
const COLLAPSED_HEIGHT = 88
const EXPANDED_HEIGHT = 220

export default function App() {
  const progress = useSharedValue(0)
  const scale = useSharedValue(REST_SCALE)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      height: interpolate(
        progress.value,
        [0, 1],
        [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
        Extrapolation.CLAMP
      ),
    }
  })

  return (
    <AnimatedPressable
      style={[styles.cta, animatedStyle]}
      onPressIn={() => {
        scale.value = withTiming(PRESSED_SCALE, PRESS_IN_CONFIG)
        progress.value = withTiming(1, PRESS_IN_CONFIG)
      }}
      onPressOut={() => {
        scale.value = withTiming(REST_SCALE, PRESS_OUT_CONFIG)
        progress.value = withTiming(0, PRESS_OUT_CONFIG)
      }}
    >
      <Text style={styles.ctaText}>Continue</Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f4fd1',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
