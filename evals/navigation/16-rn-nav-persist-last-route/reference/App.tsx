import { useEffect, useState } from 'react'

import {
  createStaticNavigation,
  NavigationState,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, Button, StyleSheet, View } from 'react-native'
import { StaticParamList, useNavigation } from '@react-navigation/core'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STATE_KEY = 'NAV_STATE_V1'

function HomeScreen() {
  const { navigate } = useNavigation()
  return (
    <View style={styles.container}>
      <Button title="Go to details" onPress={() => navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  const { goBack } = useNavigation()
  return (
    <View style={styles.container}>
      <Button title="Back home" onPress={() => goBack()} />
    </View>
  )
}

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const [initialState, setInitialState] = useState<
    Readonly<NavigationState> | undefined
  >()

  useEffect(() => {
    const restoreState = async () => {
      try {
        const persistedNav = await AsyncStorage.getItem(STATE_KEY)
        if (!persistedNav) {
          return
        }
        setInitialState(JSON.parse(persistedNav))
      } catch {
        setInitialState(undefined)
      } finally {
        setIsReady(true)
      }
    }

    void restoreState()
  }, [])

  const handleNavStateChange = (
    state: Readonly<NavigationState> | undefined
  ) => {
    if (!state) {
      return
    }
    void AsyncStorage.setItem(STATE_KEY, JSON.stringify(state))
  }

  if (!isReady) {
    return <ActivityIndicator />
  }

  return (
    <Navigation
      initialState={initialState}
      onStateChange={handleNavStateChange}
    />
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

const Navigation = createStaticNavigation(RootStack)

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
