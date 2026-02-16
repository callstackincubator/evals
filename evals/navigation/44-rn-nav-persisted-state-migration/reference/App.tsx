import { useEffect, useState } from 'react'

import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()
const NAV_VERSION = 2
const STORAGE_KEY = 'NAV_STATE_WITH_VERSION'

const memoryStorage: Record<string, string | undefined> = {}

function HomeScreen() {
  const navigation = useNavigation()

  const handleOpenDetails = () => {
    navigation.navigate('Details')
  }

  return (
    <View style={styles.centered}>
      <Button title="Open details" onPress={handleOpenDetails} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.centered}>
      <Text>Details</Text>
    </View>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [initialState, setInitialState] = useState<any>()

  useEffect(() => {
    const raw = memoryStorage[STORAGE_KEY]
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.version === NAV_VERSION && parsed?.state) {
          setInitialState(parsed.state)
        }
      } catch {
        setInitialState(undefined)
      }
    }
    setReady(true)
  }, [])

  const handleStateChange = (state: any) => {
    memoryStorage[STORAGE_KEY] = JSON.stringify({ version: NAV_VERSION, state })
  }

  if (!ready) {
    return null
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={handleStateChange}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
