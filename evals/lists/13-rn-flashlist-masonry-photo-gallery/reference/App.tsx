import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

const PHOTOS = [
  { id: 'photo-1', label: 'Lakeside', height: 160 },
  { id: 'photo-2', label: 'Transit', height: 220 },
  { id: 'photo-3', label: 'Bridge', height: 140 },
  { id: 'photo-4', label: 'Studio', height: 260 },
  { id: 'photo-5', label: 'Valley', height: 180 },
  { id: 'photo-6', label: 'Warehouse', height: 210 },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Gallery</Text>
      <FlashList
        data={PHOTOS}
        keyExtractor={(item) => item.id}
        masonry
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <View style={[styles.card, { height: item.height }]}>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#dbeafe',
    borderRadius: 18,
    margin: 6,
    padding: 14,
  },
  cardLabel: {
    color: '#0f172a',
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#eff6ff',
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
})
