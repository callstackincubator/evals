import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

const RAIL_ITEMS = [
  {
    id: 'header',
    type: 'header',
    title: 'Curated picks',
    eyebrow: 'For you',
  },
  { id: 'video-1', type: 'media', title: 'Watchlist 1', height: 180 },
  { id: 'video-2', type: 'media', title: 'Watchlist 2', height: 220 },
  { id: 'video-3', type: 'media', title: 'Watchlist 3', height: 160 },
  { id: 'video-4', type: 'media', title: 'Watchlist 4', height: 240 },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <FlashList
        data={RAIL_ITEMS}
        getItemType={(item) => item.type}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.headerCard}>
                <Text style={styles.headerEyebrow}>{item.eyebrow}</Text>
                <Text style={styles.headerTitle}>{item.title}</Text>
              </View>
            )
          }

          return (
            <View style={[styles.card, { height: item.height }]}>
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
})
