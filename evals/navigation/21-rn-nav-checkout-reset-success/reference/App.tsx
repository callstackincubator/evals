import { CommonActions, createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { StaticParamList, useNavigation } from '@react-navigation/core'

function CartScreen() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Cart</Text>
      <Button title="Start checkout" onPress={() => navigate('Shipping')} />
    </View>
  )
}

function ShippingScreen() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Shipping</Text>
      <Button title="Continue" onPress={() => navigate('Payment')} />
    </View>
  )
}

function PaymentScreen() {
  const { dispatch } = useNavigation()

  const completeCheckout = () => {
    dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Success' }],
      })
    )
  }

  return (
    <View style={styles.container}>
      <Text>Payment</Text>
      <Button title="Pay now" onPress={completeCheckout} />
    </View>
  )
}

function SuccessScreen() {
  const { dispatch } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Success</Text>
      <Button
        title="Continue to Home"
        onPress={() =>
          dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          )
        }
      />
    </View>
  )
}

function HomeScreen() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Button title="Continue to Cart" onPress={() => navigate('Cart')} />
    </View>
  )
}

export default function App() {
  return <Navigation />
}

const RootStack = createNativeStackNavigator({
  screens: {
    Cart: CartScreen,
    Shipping: ShippingScreen,
    Payment: PaymentScreen,
    Success: SuccessScreen,
    Home: HomeScreen,
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
