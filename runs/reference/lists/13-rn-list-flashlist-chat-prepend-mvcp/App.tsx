import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { useRef, useState } from 'react'

type Message = {
  id: string
  text: string
}

const PAGE_SIZE = 12
const INITIAL_OLDEST_CURSOR = 200
const MIN_CURSOR = 1
const PREPEND_DELAY_MS = 450
const FLASH_LIST_CONFIG = {
  autoScrollToBottomThreshold: 0.2,
  nearBottomThreshold: 120,
  scrollEventThrottle: 16,
  startReachedThreshold: 0.15,
}

function buildRange(start: number, count: number): Message[] {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return {
      id: `msg-${value}`,
      text: `Message ${value}`,
    }
  })
}

function getMessageIdValue(id: string) {
  return Number(id.replace('msg-', ''))
}

export default function App() {
  const listRef = useRef<FlashListRef<Message>>(null)
  const nearBottomRef = useRef(true)
  const loadingOlderRef = useRef(false)
  const oldestCursorRef = useRef(INITIAL_OLDEST_CURSOR)

  const [messages, setMessages] = useState<Message[]>(() =>
    buildRange(INITIAL_OLDEST_CURSOR, PAGE_SIZE)
  )
  const [loadingOlder, setLoadingOlder] = useState(false)

  const prependOlder = () => {
    if (loadingOlderRef.current || oldestCursorRef.current <= MIN_CURSOR) {
      return
    }

    loadingOlderRef.current = true
    setLoadingOlder(true)

    setTimeout(() => {
      const nextStart = Math.max(
        MIN_CURSOR,
        oldestCursorRef.current - PAGE_SIZE
      )
      const count = oldestCursorRef.current - nextStart
      const older = buildRange(nextStart, count)

      setMessages((prev) => [...older, ...prev])
      oldestCursorRef.current = nextStart
      loadingOlderRef.current = false
      setLoadingOlder(false)
    }, PREPEND_DELAY_MS)
  }

  const appendMessage = () => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      const lastIdValue = lastMessage
        ? getMessageIdValue(lastMessage.id)
        : INITIAL_OLDEST_CURSOR - 1
      const nextIdValue = lastIdValue + 1

      return [
        ...prev,
        {
          id: `msg-${nextIdValue}`,
          text: `New message ${nextIdValue}`,
        },
      ]
    })

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
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{
          autoscrollToBottomThreshold:
            FLASH_LIST_CONFIG.autoScrollToBottomThreshold,
        }}
        onScroll={({ nativeEvent }) => {
          const distanceFromBottom =
            nativeEvent.contentSize.height -
            (nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height)

          nearBottomRef.current =
            distanceFromBottom <= FLASH_LIST_CONFIG.nearBottomThreshold
        }}
        onStartReached={prependOlder}
        onStartReachedThreshold={FLASH_LIST_CONFIG.startReachedThreshold}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        scrollEventThrottle={FLASH_LIST_CONFIG.scrollEventThrottle}
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
