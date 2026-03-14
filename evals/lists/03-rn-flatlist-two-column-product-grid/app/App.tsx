import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const PRODUCTS = Array.from({ length: 8 }, (_, index) => ({
  id: `product-${index + 1}`,
  name: `Everyday Item ${index + 1}`,
  price: `$${(24 + index * 3).toFixed(2)}`,
}))

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Catalog</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#eff6ff',
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
