import { Pressable, StyleSheet, Text, View } from 'react-native'
import { KeyboardProvider, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

function mapKeyboardToComposerOffset(height: number) {
  // TODO: tune keyboard-aware composer positioning
  return Math.max(0, height)
}

function KeyboardScreen() {
  const keyboard = useReanimatedKeyboardAnimation()

  const composerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -mapKeyboardToComposerOffset(Math.abs(keyboard.height.value)) }],
  }))

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Keyboard Starter</Text>
      <Animated.View style={[styles.composer, composerStyle]}>
        <Text style={styles.subtitle}>Composer placeholder</Text>
      </Animated.View>
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>No-op action</Text>
      </Pressable>
    </View>
  )
}

export default function App() {
  return (
    <KeyboardProvider>
      <KeyboardScreen />
    </KeyboardProvider>
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
  composer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 12,
  },
  subtitle: {
    color: '#334155',
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
})
