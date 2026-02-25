import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['Product 42', 'Product 84']

async function openProductDetailsAction() {
  // No-op
  return 'pending'
}

function ProductsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Products</Text>
      <Text style={styles.copy}>
        Product list is ready. Choose an item to continue.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => openProductDetailsAction()}
      />
    </View>
  )
}

function ProductDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ProductDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
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

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  copy: {
    color: '#6b7280',
    textAlign: 'center',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
