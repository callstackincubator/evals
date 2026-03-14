import React, { useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native'

const VIDEOS = Array.from({ length: 10 }, (_, index) => ({
  id: `clip-${index + 1}`,
  title: `Clip ${index + 1}`,
  creator: index % 2 === 0 ? 'Studio North' : 'Studio South',
}))

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 70,
  minimumViewTime: 150,
}

export default function App() {
  const [visibleIds, setVisibleIds] = useState<string[]>([])

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: Array<ViewToken<(typeof VIDEOS)[number]>>
  }) => {
    setVisibleIds(
      viewableItems
        .filter((token) => token.isViewable && token.item)
        .map((token) => token.item.id)
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Highlights</Text>
      <FlatList
        data={VIDEOS}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item }) => {
          const isVisible = visibleIds.includes(item.id)

          return (
            <View style={styles.card}>
              <View style={styles.thumbnail} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.creator}</Text>
              <Text style={[styles.visible, isVisible && styles.visibleActive]}>
                {isVisible ? 'Visible' : 'Idle'}
              </Text>
            </View>
          )
        }}
        viewabilityConfig={VIEWABILITY_CONFIG}
      />
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  thumbnail: {
    backgroundColor: '#cbd5f5',
    borderRadius: 14,
    height: 180,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  visible: {
    color: '#475569',
    marginTop: 12,
  },
  visibleActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
})
