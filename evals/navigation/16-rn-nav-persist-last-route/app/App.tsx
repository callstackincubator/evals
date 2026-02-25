import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const NAV_STATE_KEY = 'nav-state-v1'
const memoryStorage: Record<string, string | undefined> = {}

async function loadPersistedNavigationState() {
  // TODO: restore and validate persisted navigation state
  return memoryStorage[NAV_STATE_KEY] ?? null
}

async function savePersistedNavigationState(state: unknown) {
  // TODO: persist serialized navigation state
  memoryStorage[NAV_STATE_KEY] = JSON.stringify(state)
}

function HomeScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('idle')

  const runPersistencePlaceholder = async () => {
    await savePersistedNavigationState({ route: 'Home' })
    await loadPersistedNavigationState()
    setStatus('persistence-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Persistence status: {status}</Text>
      <Button title="Call persistence placeholders" onPress={runPersistencePlaceholder} />
      <Button title="Open details" onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
