import React, { useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const INITIAL_POSTS = Array.from({ length: 8 }, (_, index) => ({
  id: `post-${index + 1}`,
  title: `Ops update ${index + 1}`,
}))

const updateFeedData = (current: typeof INITIAL_POSTS) => [
  {
    id: `post-${current.length + 1}`,
    title: `Ops update ${current.length + 1}`,
  },
  ...current,
]

export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setPosts(updateFeedData)
    setRefreshing(false)
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
  },
  rowTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
})
