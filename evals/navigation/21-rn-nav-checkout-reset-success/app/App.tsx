import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['cart items']

async function completeCheckoutAction() {
  // No-op
  return 'pending'
}

function CartScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cart</Text>
      <Text style={styles.copy}>
        Checkout steps are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => completeCheckoutAction()}
      />
    </View>
  )
}

function ShippingScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Shipping</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

function SuccessScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Success</Text>
      <Text style={styles.copy}>
        More details appear here.
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
