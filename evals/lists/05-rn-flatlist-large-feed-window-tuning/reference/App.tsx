import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const POSTS = Array.from({ length: 80 }, (_, index) => ({
  id: `post-${index + 1}`,
  title: `Field report ${index + 1}`,
  summary: 'A compact status update from the operating floor.',
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Operations Feed</Text>
      <FlatList
        data={POSTS}
        initialNumToRender={8}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={6}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.summary}</Text>
            </View>
          )
        }}
        updateCellsBatchingPeriod={40}
        windowSize={9}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
  },
  cardBody: {
    color: '#475569',
    marginTop: 6,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
