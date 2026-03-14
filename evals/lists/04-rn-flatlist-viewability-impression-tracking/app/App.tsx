import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const VIDEOS = Array.from({ length: 10 }, (_, index) => ({
  id: `clip-${index + 1}`,
  title: `Clip ${index + 1}`,
  creator: index % 2 === 0 ? 'Studio North' : 'Studio South',
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Highlights</Text>
      <Text style={styles.subtitle}>Clips: {VIDEOS.length}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    color: '#334155',
    marginTop: 6,
    textAlign: 'center',
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
})
