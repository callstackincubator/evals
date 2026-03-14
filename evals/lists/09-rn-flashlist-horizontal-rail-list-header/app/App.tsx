import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const VIDEOS = Array.from({ length: 8 }, (_, index) => ({
  id: `video-${index + 1}`,
  title: `Watchlist ${index + 1}`,
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Up next</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginRight: 12,
    padding: 12,
    width: 172,
  },
  cardTitle: {
    color: '#0f172a',
    fontWeight: '700',
    marginTop: 10,
  },
  poster: {
    backgroundColor: '#dbeafe',
    borderRadius: 14,
    height: 180,
  },
  screen: {
    backgroundColor: '#eff6ff',
    flex: 1,
    paddingLeft: 16,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
  },
})
