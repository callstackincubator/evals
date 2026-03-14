import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const VIDEOS = [
  { id: 'video-1', title: 'Watchlist 1', height: 180 },
  { id: 'video-2', title: 'Watchlist 2', height: 220 },
  { id: 'video-3', title: 'Watchlist 3', height: 160 },
  { id: 'video-4', title: 'Watchlist 4', height: 240 },
]

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
    justifyContent: 'flex-end',
    marginRight: 12,
    padding: 12,
    width: 172,
  },
  cardTitle: {
    color: '#0f172a',
    fontWeight: '700',
  },
  headerCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    justifyContent: 'space-between',
    marginRight: 12,
    padding: 16,
    width: 172,
  },
  headerEyebrow: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
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
