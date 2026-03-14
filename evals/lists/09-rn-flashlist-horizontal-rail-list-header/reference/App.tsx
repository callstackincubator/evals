import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

const VIDEOS = Array.from({ length: 8 }, (_, index) => ({
  id: `video-${index + 1}`,
  title: `Watchlist ${index + 1}`,
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Up next</Text>
      <FlashList
        data={VIDEOS}
        horizontal
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.headerEyebrow}>For you</Text>
            <Text style={styles.headerTitle}>Curated picks</Text>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <View style={styles.poster} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          )
        }}
      />
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
  headerCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
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
