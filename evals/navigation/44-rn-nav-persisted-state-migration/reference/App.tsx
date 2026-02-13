import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()
const NAV_VERSION = 2
const STORAGE_KEY = 'NAV_STATE_WITH_VERSION'

const memoryStorage: Record<string, string | undefined> = {}

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details</Text>
    </View>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [initialState, setInitialState] = useState<any>()

  useEffect(() => {
    const bootstrap = () => {
      const raw = memoryStorage[STORAGE_KEY]
      if (!raw) {
        setReady(true)
        return
      }

      try {
        const parsed = JSON.parse(raw)
        if (parsed?.version === NAV_VERSION && parsed?.state) {
          setInitialState(parsed.state)
        } else {
          setInitialState(undefined)
        }
      } catch {
        setInitialState(undefined)
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
      initialState={initialState}
      onStateChange={(state) => {
        memoryStorage[STORAGE_KEY] = JSON.stringify({ version: NAV_VERSION, state })
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
