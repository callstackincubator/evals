import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const PRESSED_SCALE = 0.94
const REST_SCALE = 1

export default function App() {
  const scale = useSharedValue(REST_SCALE)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  return (
    <View style={styles.container}>
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(PRESSED_SCALE, { duration: 120 })
        }}
        onPressOut={() => {
          scale.value = withTiming(REST_SCALE, { duration: 140 })
        }}
      >
        <Animated.View style={[styles.cta, animatedStyle]}>
          <Text style={styles.ctaText}>Continue</Text>
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cta: {
    backgroundColor: '#1f4fd1',
    borderRadius: 14,
    minWidth: 180,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})
