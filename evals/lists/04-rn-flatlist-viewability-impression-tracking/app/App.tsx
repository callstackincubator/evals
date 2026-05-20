import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const VIDEOS = Array.from({ length: 10 }, (_, index) => ({
  id: `clip-${index + 1}`,
  title: `Clip ${index + 1}`,
  creator: index % 2 === 0 ? 'Studio North' : 'Studio South',
}))

function VideoCard({
  item,
}: {
  item: (typeof VIDEOS)[number]
}) {
  return (
    <View style={styles.card}>
      <View style={styles.thumbnail} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.meta}>{item.creator}</Text>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.screen} />
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    padding: 14,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
  },
  meta: {
    color: '#64748b',
    marginTop: 4,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  thumbnail: {
    backgroundColor: '#cbd5f5',
    borderRadius: 14,
    height: 180,
  },
})
