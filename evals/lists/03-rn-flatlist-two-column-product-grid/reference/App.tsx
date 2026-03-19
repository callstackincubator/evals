import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const PRODUCTS = Array.from({ length: 8 }, (_, index) => ({
  id: `product-${index + 1}`,
  name: `Everyday Item ${index + 1}`,
  price: `$${(24 + index * 3).toFixed(2)}`,
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <FlatList
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.content}
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <View style={styles.thumbnail} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
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
    borderRadius: 16,
    flex: 1,
    padding: 12,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  content: {
    paddingBottom: 20,
  },
  name: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  price: {
    color: '#2563eb',
    marginTop: 6,
  },
  screen: {
    backgroundColor: '#eff6ff',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  thumbnail: {
    backgroundColor: '#bfdbfe',
    borderRadius: 12,
    height: 92,
  },
})
