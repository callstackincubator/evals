import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

type RootParamList = {
  OrderDetails: { orderId?: number }
}

const Stack = createNativeStackNavigator<RootParamList>()

const linking: LinkingOptions<RootParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      OrderDetails: {
        path: 'orders/:orderId',
        parse: {
          orderId: (value: string) => {
            const parsed = Number(value)
            return Number.isFinite(parsed) ? parsed : Number.NaN
          },
        },
      },
    },
  },
}

function OrderDetailsScreen({ route }: { route: any }) {
  const orderId = route.params?.orderId
  const isValid = typeof orderId === 'number' && Number.isFinite(orderId)

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {isValid ? <Text>Order #{orderId}</Text> : <Text>Invalid order link</Text>}
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name='OrderDetails' component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
