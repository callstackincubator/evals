import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { memo, useCallback, useRef, useState } from 'react'

type Message = {
  id: string
  text: string
}

const PAGE_SIZE = 24
const INITIAL_CURSOR = 100
const MIN_CURSOR = 1
const TOP_REACHED_OFFSET = 8
const LOAD_DELAY_MS = 450

function buildMessages(start: number, count: number): Message[] {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return {
      id: `msg-${value}`,
      text: `Message ${value}`,
    }
  })
}

const MessageBubble = memo(function MessageBubble({ text }: { text: string }) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  )
})

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() =>
    buildMessages(INITIAL_CURSOR, PAGE_SIZE)
  )
  const [loadingOlder, setLoadingOlder] = useState(false)
  const loadingOlderRef = useRef(false)
  const cursorRef = useRef(INITIAL_CURSOR)

  const loadOlder = useCallback(() => {
    if (loadingOlderRef.current || cursorRef.current <= MIN_CURSOR) {
      return
    }

    loadingOlderRef.current = true
    setLoadingOlder(true)

    setTimeout(() => {
      const nextStart = Math.max(MIN_CURSOR, cursorRef.current - PAGE_SIZE)
      const count = cursorRef.current - nextStart
      const older = buildMessages(nextStart, count)

      setMessages((prev) => [...older, ...prev])
      cursorRef.current = nextStart
      loadingOlderRef.current = false
      setLoadingOlder(false)
    }, LOAD_DELAY_MS)
  }, [])

  const keyExtractor = useCallback((item: Message) => item.id, [])

  const onScroll = useCallback(
    ({ nativeEvent }: { nativeEvent: { contentOffset: { y: number } } }) => {
      if (nativeEvent.contentOffset.y <= TOP_REACHED_OFFSET) {
        loadOlder()
      }
    },
    [loadOlder]
  )

  const renderItem: ListRenderItem<Message> = ({ item }) => (
    <MessageBubble text={item.text} />
  )

  return (
    <View style={styles.container}>
      {loadingOlder ? (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Loading older messages...</Text>
        </View>
      ) : null}

      <FlatList
        data={messages}
        keyExtractor={keyExtractor}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onScroll={onScroll}
        renderItem={renderItem}
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
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleText: {
    color: '#111827',
    fontSize: 15,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  loadingBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    color: '#374151',
    marginLeft: 8,
  },
})
