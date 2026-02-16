import React from 'react'
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Products: undefined
  ProductDetails: { productId?: string; title: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function ProductsScreen() {
  const navigation = useNavigation()

  const handleNavigateToDetails = () => {
    navigation.navigate('ProductDetails', {
      productId: '42',
      title: 'Product 42',
    })
  }
  const handleNavigateToMissingProduct = () => {
    navigation.navigate('ProductDetails', { title: 'Missing Product' })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <Button
        title="Open Product 42"
        onPress={handleNavigateToDetails}
      />
      <Button
        title="Open Missing Product"
        onPress={handleNavigateToMissingProduct}
      />
    </View>
  )
}

function ProductDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetails'>>()
  const { params: { productId, title } } = route

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>
      <Text>
        {productId
          ? `productId: ${productId}`
          : 'productId unavailable, showing fallback details'
        }
      </Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Products"
          component={ProductsScreen}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
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
