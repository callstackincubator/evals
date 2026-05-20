import React, { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const INITIAL_MESSAGES = Array.from({ length: 8 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: index % 2 === 0 ? 'Jordan' : 'Ops',
  text: `Chat message ${index + 1}`,
}))

export default function App() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            setMessages((current) => [
              ...current,
              {
                id: `message-${current.length + 1}`,
                from: current.length % 2 === 0 ? 'Jordan' : 'Ops',
                text: `Chat message ${current.length + 1}`,
              },
            ])
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add message</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    color: '#0f172a',
    marginTop: 4,
  },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    padding: 12,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screen: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  sender: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
})
