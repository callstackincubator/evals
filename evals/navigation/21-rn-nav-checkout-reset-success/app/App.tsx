import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type CheckoutResult = {
  orderId: string
  success: boolean
}

async function submitCheckout(): Promise<CheckoutResult> {
  // TODO: implement checkout request and response handling
  return {
    orderId: 'placeholder-order',
    success: false,
  }
}

function CheckoutScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('idle')

  const runCheckoutPlaceholder = async () => {
    await submitCheckout()
    setStatus('checkout-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Checkout status: {status}</Text>
      <Button title="Call checkout placeholder" onPress={runCheckoutPlaceholder} />
      <Button title="Open details" onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Success</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Checkout: CheckoutScreen,
    Details: DetailsScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
