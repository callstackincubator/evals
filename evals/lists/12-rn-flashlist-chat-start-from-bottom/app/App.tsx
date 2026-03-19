import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const INITIAL_MESSAGES = Array.from({ length: 8 }, (_, index) => ({
  id: `message-${index + 1}`,
  from: index % 2 === 0 ? 'Jordan' : 'Ops',
  text: `Chat message ${index + 1}`,
}))

function MessageBubble({
  item,
}: {
  item: (typeof INITIAL_MESSAGES)[number]
}) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.sender}>{item.from}</Text>
      <Text style={styles.body}>{item.text}</Text>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.screen} />
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
