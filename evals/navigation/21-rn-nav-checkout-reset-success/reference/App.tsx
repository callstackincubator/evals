import { CommonActions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function CartScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text>Cart</Text>
      <Button title='Start checkout' onPress={() => navigation.navigate('Shipping')} />
    </View>
  )
}

function ShippingScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text>Shipping</Text>
      <Button title='Continue' onPress={() => navigation.navigate('Payment')} />
    </View>
  )
}

function PaymentScreen({ navigation }: { navigation: any }) {
  const completeCheckout = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Success' }],
      }),
    )
  }

  return (
    <View style={styles.container}>
      <Text>Payment</Text>
      <Button title='Pay now' onPress={completeCheckout} />
    </View>
  )
}

function SuccessScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text>Success</Text>
      <Button
        title='Continue to Home'
        onPress={() =>
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            }),
          )
        }
      />
    </View>
  )
}

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Cart' component={CartScreen} />
        <Stack.Screen name='Shipping' component={ShippingScreen} />
        <Stack.Screen name='Payment' component={PaymentScreen} />
        <Stack.Screen name='Success' component={SuccessScreen} />
        <Stack.Screen name='Home' component={HomeScreen} />
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
})
