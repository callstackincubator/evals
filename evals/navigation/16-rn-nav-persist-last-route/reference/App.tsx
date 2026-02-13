import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, View } from 'react-native'

const Stack = createNativeStackNavigator()
const STATE_KEY = 'NAV_STATE_V1'

const memoryStorage: Record<string, string | undefined> = {}

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Go to details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Back home' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const [initialState, setInitialState] = useState<any>()

  useEffect(() => {
    const restoreState = async () => {
      const raw = memoryStorage[STATE_KEY]
      if (raw) {
        try {
          setInitialState(JSON.parse(raw))
        } catch {
          setInitialState(undefined)
        }
      }
      setIsReady(true)
    }

    restoreState()
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        if (state) {
          memoryStorage[STATE_KEY] = JSON.stringify(state)
        }
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
