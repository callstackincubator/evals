import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ListRenderItemInfo,
} from 'react-native'
import {
  KeyboardProvider,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCallback } from 'react'

const MESSAGES = [
  'Ship the animation evals',
  'Validate gesture edge cases',
  'Confirm keyboard behavior on Android',
  'Document threshold semantics',
]

function ComposerDemo() {
  const keyboard = useReanimatedKeyboardAnimation()
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets()

  const reversedMessages = [...MESSAGES].reverse()
  const animatedComposerStyle = useAnimatedStyle(() => {
    const keyboardHeight = Math.abs(keyboard.height.value)

    const translateY = -Math.max(keyboardHeight, bottomInset)

    return {
      transform: [{ translateY }],
    }
  })

  const animatedListStyle = useAnimatedStyle(() => {
    const raw = keyboard.height.value + bottomInset

    const offset = raw < 0 ? -raw : 0

    return {
      marginBottom: offset,
    }
  })

  const renderMessage = useCallback(
    ({ item: message, index }: ListRenderItemInfo<string>) => {
      const receivedMessage = index % 2 === 0
      return (
        <View
          key={message}
          style={[
            styles.messageBubble,
            { alignSelf: receivedMessage ? 'flex-start' : 'flex-end' },
          ]}
        >
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )
    },
    []
  )

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <Animated.View style={[styles.messagesContainer, animatedListStyle]}>
        <FlatList
          style={{ marginBottom: bottomInset }}
          contentContainerStyle={styles.messageList}
          inverted
          data={reversedMessages}
          renderItem={renderMessage}
        />
      </Animated.View>

      <Animated.View style={[styles.composerBar, animatedComposerStyle]}>
        <TextInput
          placeholder="Type a message"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
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
  messagesContainer: {
    flex: 1,
  },
  composerBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '60%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageList: {
    paddingHorizontal: 14,
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
