import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const CARD = {
  title: 'Dispatch inbox',
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inbox</Text>
      <View style={styles.card}>
        <View style={styles.thumbnail} />
        <Text style={styles.cardTitle}>{CARD.title}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    padding: 14,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  thumbnail: {
    backgroundColor: '#cbd5e1',
    height: 160,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
