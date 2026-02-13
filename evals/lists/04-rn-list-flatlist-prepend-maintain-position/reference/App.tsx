import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useCallback, useState } from 'react'

type Message = {
  id: string
  text: string
}

const PAGE_SIZE = 15

function buildMessages(start: number, count: number): Message[] {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return {
      id: `msg-${value}`,
      text: `Message ${value}`,
    }
  })
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => buildMessages(100, PAGE_SIZE))
  const [cursor, setCursor] = useState(100)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const loadOlder = useCallback(() => {
    if (loadingOlder || cursor <= 1) {
      return
    }

    setLoadingOlder(true)

    setTimeout(() => {
      const nextStart = Math.max(1, cursor - PAGE_SIZE)
      const count = cursor - nextStart
      const older = buildMessages(nextStart, count)

      setMessages((prev) => [...older, ...prev])
      setCursor(nextStart)
      setLoadingOlder(false)
    }, 450)
  }, [cursor, loadingOlder])

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
        keyExtractor={(item) => item.id}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y <= 8) {
            loadOlder()
          }
        }}
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
