import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['Product 42', 'Product 84']

async function openProductDetailsPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function ProductsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Products</Text>
      <Text style={styles.copy}>
        Product list seed is ready for details navigation behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Call placeholder"
        onPress={() => openProductDetailsPlaceholder()}
      />
    </View>
  )
}

function ProductDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ProductDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
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
