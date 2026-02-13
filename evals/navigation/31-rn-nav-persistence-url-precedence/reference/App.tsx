import { useEffect, useState } from 'react'

import { Linking } from 'react-native'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()
const PERSISTED_NAV_KEY = 'NAV_STATE_V1'
const memoryStorage: Record<string, string | undefined> = {}

const linking: LinkingOptions<any> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: '',
      Promo: 'promo/:id',
    },
  },
}

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Home</Text>
      <Button title='Open promo 7' onPress={() => navigation.navigate('Promo', { id: '7' })} />
    </View>
  )
}

function PromoScreen({ route }: { route: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Promo {route.params?.id}</Text>
    </View>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [initialState, setInitialState] = useState<any>()

  useEffect(() => {
    const bootstrap = async () => {
      const startupUrl = await Linking.getInitialURL()
      const hasStartupUrl = Boolean(startupUrl)

      if (!hasStartupUrl) {
        const rawPersisted = memoryStorage[PERSISTED_NAV_KEY]
        if (rawPersisted) {
          setInitialState(JSON.parse(rawPersisted))
        }
      }

      setReady(true)
    }

    bootstrap()
  }, [])

  if (!ready) {
    return null
  }

  return (
    <NavigationContainer
      linking={linking}
      initialState={initialState}
      onStateChange={(state) => {
        memoryStorage[PERSISTED_NAV_KEY] = JSON.stringify(state)
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Promo' component={PromoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
