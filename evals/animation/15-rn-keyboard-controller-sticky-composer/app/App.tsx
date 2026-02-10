import { StyleSheet, Text, TextInput, View } from 'react-native'
import { KeyboardProvider, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated'

const MESSAGES = [
  'Ship the animation evals',
  'Validate gesture edge cases',
  'Confirm keyboard behavior on Android',
  'Document threshold semantics',
  'Merge after lint and checks',
]

function ComposerDemo() {
  const keyboard = useReanimatedKeyboardAnimation()

  const composerStyle = useAnimatedStyle(() => {
    return {
      borderTopColor: interpolateColor(keyboard.progress.value, [0, 1], ['#cbd5e1', '#2563eb']),
      transform: [{ translateY: -keyboard.height.value }],
    }
  })

  return (
    <View style={styles.screen}>
      <View style={styles.messageList}>
        {MESSAGES.map((message) => {
          return (
            <View key={message} style={styles.messageBubble}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )
        })}
      </View>

      <Animated.View style={[styles.composerBar, composerStyle]}>
        <TextInput placeholder='Type a message' placeholderTextColor='#64748b' style={styles.input} />
      </Animated.View>
    </View>
  )
}

export default function App() {
  return (
    <KeyboardProvider>
      <ComposerDemo />
    </KeyboardProvider>
  )
}

const styles = StyleSheet.create({
  composerBar: {
    backgroundColor: '#fff',
    borderTopWidth: 2,
    bottom: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    right: 0,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    color: '#0f172a',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageList: {
    paddingBottom: 120,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  messageText: {
    color: '#0f172a',
    fontSize: 15,
  },
  screen: {
    backgroundColor: '#dbeafe',
    flex: 1,
  },
})
