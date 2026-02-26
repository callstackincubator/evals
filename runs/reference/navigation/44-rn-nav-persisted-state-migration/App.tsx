import { useEffect, useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type { StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native'

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
      <Button title="Open" onPress={handleOpenDetails} />
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

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

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
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Navigation initialState={initialState} onStateChange={handleStateChange} />
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
