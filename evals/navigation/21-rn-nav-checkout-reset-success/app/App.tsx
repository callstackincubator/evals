import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['cart items']

async function completeCheckoutPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function CartScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cart</Text>
      <Text style={styles.copy}>
        Checkout routes are scaffolded for reset-to-success behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Call placeholder"
        onPress={() => completeCheckoutPlaceholder()}
      />
    </View>
  )
}

function ShippingScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Shipping</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

function SuccessScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Success</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Cart: CartScreen,
    Shipping: ShippingScreen,
    Success: SuccessScreen,
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
