import React from 'react'
import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const PRODUCT = { id: '42', title: 'Product 42' } as const

function ProductsScreen() {
  const navigation = useNavigation()

  const handleNavigateToDetails = () => {
    navigation.navigate('ProductDetails', {
      productId: PRODUCT.id,
      title: PRODUCT.title,
    })
  }
  const handleNavigateToMissingProduct = () => {
    navigation.navigate('ProductDetails', { title: 'Missing Product' })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <Button title="Open" onPress={handleNavigateToDetails} />
      <Button
        title="Open Missing Product"
        onPress={handleNavigateToMissingProduct}
      />
    </View>
  )
}

type ProductDetailsScreenProps = StaticScreenProps<{
  productId?: string
  title: string
}>

function ProductDetailsScreen({ route }: ProductDetailsScreenProps) {
  const productId = route.params?.productId
  const title = route.params?.title ?? 'Details'

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
  id: 'root',
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
