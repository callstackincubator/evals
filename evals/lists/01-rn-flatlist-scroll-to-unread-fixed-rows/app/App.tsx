import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const MESSAGES = Array.from({ length: 18 }, (_, index) => ({
  id: `message-${index + 1}`,
  sender: index % 2 === 0 ? 'Maya' : 'Inbox Bot',
  preview: `Message preview ${index + 1}`,
  unread: index >= 9 && index <= 11,
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inbox</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
})
