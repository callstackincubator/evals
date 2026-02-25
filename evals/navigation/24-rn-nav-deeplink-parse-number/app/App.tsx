import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['orderId: 101']

async function parseOrderIdAction() {
  // No-op
  return 'pending'
}

function OrdersScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.copy}>
        Orders are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Orders"
        onPress={() => parseOrderIdAction()}
      />
    </View>
  )
}

function OrderDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>OrderDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Orders: OrdersScreen,
    OrderDetails: OrderDetailsScreen,
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
