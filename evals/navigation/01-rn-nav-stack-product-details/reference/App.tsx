import React from 'react'
import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function ProductsScreen() {
  const navigation = useNavigation()

  const handleNavigateToDetails = () => {
    navigation.navigate('ProductDetails', { productId: '42' })
  }
  const handleNavigateToMissingProduct = () => {
    navigation.navigate('ProductDetails')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <Button title="Open Product 42" onPress={handleNavigateToDetails} />
      <Button
        title="Open Missing Product"
        onPress={handleNavigateToMissingProduct}
      />
    </View>
  )
}

type ProductDetailsScreenProps = StaticScreenProps<{
  productId?: string
}>

function ProductDetailsScreen({ route }: ProductDetailsScreenProps) {
  const {
    params: { productId },
  } = route
  const title = productId ? `Product ${productId}` : 'Missing Product'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>
        {productId
          ? `productId: ${productId}`
          : 'productId unavailable, showing fallback details'}
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Products: ProductsScreen,
    ProductDetails: ProductDetailsScreen,
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
