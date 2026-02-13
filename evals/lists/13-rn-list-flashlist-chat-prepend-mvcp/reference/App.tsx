import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRef, useState } from 'react'

type Message = {
  id: string
  text: string
}

const PAGE_SIZE = 12
const NEAR_BOTTOM_THRESHOLD = 120

function buildRange(start: number, count: number): Message[] {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return {
      id: `msg-${value}`,
      text: `Message ${value}`,
    }
  })
}

export default function App() {
  const listRef = useRef<FlashList<Message>>(null)
  const nearBottomRef = useRef(true)
  const loadingOlderRef = useRef(false)
  const oldestCursorRef = useRef(200)

  const [messages, setMessages] = useState<Message[]>(() => buildRange(200, PAGE_SIZE))
  const [nextMessageId, setNextMessageId] = useState(212)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const prependOlder = () => {
    if (loadingOlderRef.current || oldestCursorRef.current <= 1) {
      return
    }

    loadingOlderRef.current = true
    setLoadingOlder(true)

    setTimeout(() => {
      const nextStart = Math.max(1, oldestCursorRef.current - PAGE_SIZE)
      const count = oldestCursorRef.current - nextStart
      const older = buildRange(nextStart, count)

      setMessages((prev) => [...older, ...prev])
      oldestCursorRef.current = nextStart
      loadingOlderRef.current = false
      setLoadingOlder(false)
    }, 450)
  }

  const appendMessage = () => {
    const id = nextMessageId

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${id}`,
        text: `New message ${id}`,
      },
    ])
    setNextMessageId((prev) => prev + 1)

    if (nearBottomRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true })
      })
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Pressable onPress={prependOlder} style={styles.buttonMuted}>
          <Text style={styles.buttonMutedText}>
            {loadingOlder ? 'Loading older...' : 'Load older'}
          </Text>
        </Pressable>

        <Pressable onPress={appendMessage} style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Add new message</Text>
        </Pressable>
      </View>

      <FlashList
        ref={listRef}
        data={messages}
        estimatedItemSize={56}
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{
          autoscrollToBottomThreshold: 0.2,
          minIndexForVisible: 0,
        }}
        onScroll={({ nativeEvent }) => {
          const distanceFromBottom =
            nativeEvent.contentSize.height -
            (nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height)

          nearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD
        }}
        onStartReached={prependOlder}
        onStartReachedThreshold={0.15}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        scrollEventThrottle={16}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    maxWidth: '84%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleText: {
    color: '#111827',
    fontSize: 15,
  },
  buttonMuted: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonMutedText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: 12,
  },
})
