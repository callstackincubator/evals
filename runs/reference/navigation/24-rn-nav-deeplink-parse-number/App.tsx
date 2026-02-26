import {
  createStaticNavigation,
  type LinkingOptions,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

type RootParamList = {
  OrderDetails: { orderId?: number }
}

type OrderDetailsScreenProps = NativeStackScreenProps<
  RootParamList,
  'OrderDetails'
>

const LINK_PREFIXES = ['myapp://']
const ORDER_ID_PATTERN = /^\d+$/

function parseOrderId(value: string): number | undefined {
  if (!ORDER_ID_PATTERN.test(value)) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}

function OrderDetailsScreen({ route }: OrderDetailsScreenProps) {
  const orderId = route.params?.orderId
  const isValidOrderId = Number.isSafeInteger(orderId) && orderId > 0

  return (
    <View style={styles.container}>
      {isValidOrderId ? (
        <Text>Order #{orderId}</Text>
      ) : (
        <Text>Invalid order link</Text>
      )}
    </View>
  )
}

function stringifyOrderId(value: number): string {
  return String(value)
}

const Stack = createNativeStackNavigator<RootParamList>()
const StackNavigation = {
  ...Stack,
  config: {
    screens: {
      OrderDetails: {
        screen: OrderDetailsScreen,
        linking: {
          path: 'orders/:orderId',
          parse: {
            orderId: parseOrderId,
          },
          stringify: {
            orderId: stringifyOrderId,
          },
        },
      },
    },
  },
}
const Navigation = createStaticNavigation(StackNavigation)

const linking: LinkingOptions<RootParamList> = {
  prefixes: LINK_PREFIXES,
}

function LinkingFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  )
}

export default function App() {
  return <Navigation linking={linking} fallback={<LinkingFallback />} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
})
