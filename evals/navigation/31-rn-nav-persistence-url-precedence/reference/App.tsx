import { useEffect, useState } from 'react'

import { ActivityIndicator, Linking, StyleSheet } from 'react-native'
import {
  createStaticNavigation,
  NavigationState,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'
import {
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/core'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PERSISTED_NAV_KEY = 'NAV_STATE_V1'
const memoryStorage: Record<string, string | undefined> = {}
console.log('storage;', memoryStorage)

const linking = {
  prefixes: ['myapp://'],
}

function HomeScreen() {
  const { navigate } = useNavigation()
  return (
    <View style={styles.homeContainer}>
      <Text>Home</Text>
      <Button
        title="Open promo 7"
        onPress={() => navigate('Promo', { id: '7' })}
      />
    </View>
  )
}

function PromoScreen({ route }: StaticScreenProps<{ id: string }>) {
  return (
    <View style={styles.promoContainer}>
      <Text>Promo {route.params?.id}</Text>
    </View>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [initialState, setInitialState] = useState<
    Readonly<NavigationState> | undefined
  >()

  useEffect(() => {
    const bootstrap = async () => {
      const startupUrl = await Linking.getInitialURL()
      const hasStartupUrl = Boolean(startupUrl)

      if (hasStartupUrl) {
        setReady(true)
        return
      }

      try {
        const persistedNav = await AsyncStorage.getItem(PERSISTED_NAV_KEY)
        if (!persistedNav) {
          return
        }
        setInitialState(JSON.parse(persistedNav))
      } catch {
        setInitialState(undefined)
      } finally {
        setReady(true)
      }
    }

    void bootstrap()
  }, [])

  const handleNavStateChange = (
    state: Readonly<NavigationState> | undefined
  ) => {
    if (!state) {
      return
    }
    void AsyncStorage.setItem(PERSISTED_NAV_KEY, JSON.stringify(state))
  }

  if (!ready) {
    return <ActivityIndicator />
  }

  return (
    <Navigation
      initialState={initialState}
      onStateChange={handleNavStateChange}
      linking={linking}
    />
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Promo: {
      screen: PromoScreen,
      linking: 'promo/:id',
    },
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  promoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
