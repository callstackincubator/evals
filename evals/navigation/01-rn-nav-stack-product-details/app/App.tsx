import React from 'react'
import type { StaticParamList } from '@react-navigation/native'
import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const PRODUCTS = [
  { id: '42', title: 'Product 42' },
  { id: '84', title: 'Product 84' },
] as const

function ProductsScreen() {
  const handleNavigateToDetails = () => {}
  const handleNavigateToMissingProduct = () => {}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <Text>{`Items: ${PRODUCTS.map((product) => product.title).join(', ')}`}</Text>
      <Button title="Open" onPress={handleNavigateToDetails} />
      <Button
        title="Open Missing Product"
        onPress={handleNavigateToMissingProduct}
      />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  id: 'root',
  screens: {
    Products: ProductsScreen,
  },
})

type RootStackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
})
