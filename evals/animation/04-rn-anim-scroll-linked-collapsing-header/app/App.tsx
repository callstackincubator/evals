import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

function runAnimationPlaceholder(progress: Animated.SharedValue<number>) {
  progress.value = withTiming(progress.value === 1 ? 0 : 1)
}

export default function App() {
  const progress = useSharedValue(0)

  const cardStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + progress.value * 0.5,
    transform: [{ scale: 0.95 + progress.value * 0.05 }],
  }))

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.title}>Reanimated Starter</Text>
      </Animated.View>
      <Pressable style={styles.button} onPress={() => runAnimationPlaceholder(progress)}>
        <Text style={styles.buttonText}>Run animation placeholder</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 18,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 12,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
})
