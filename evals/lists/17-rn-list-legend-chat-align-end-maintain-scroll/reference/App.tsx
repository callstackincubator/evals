import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useState } from 'react'

type Message = {
  id: string
  text: string
}

const NEAR_BOTTOM_THRESHOLD = 0.2

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm-1', text: 'Hello' },
    { id: 'm-2', text: 'Can we sync later?' },
  ])
  const [nextId, setNextId] = useState(3)

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => {
            const id = nextId
            setMessages((prev) => [
              ...prev,
              { id: `m-${id}`, text: `New incoming message ${id}` },
            ])
            setNextId((prev) => prev + 1)
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Append message</Text>
        </Pressable>
      </View>

      <LegendList
        alignItemsAtEnd
        data={messages}
        getEstimatedItemSize={() => 58}
        keyExtractor={(item) => item.id}
        maintainScrollAtEnd={{
          autoscrollToBottomThreshold: NEAR_BOTTOM_THRESHOLD,
        }}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
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
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  toolbar: {
    marginBottom: 8,
    marginHorizontal: 12,
  },
})
