import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function getInitialUrl() {
  // TODO: read startup URL from platform/linking layer
  return null
}

async function loadPersistedNavigationState() {
  // TODO: load serialized navigation state
  return null
}

async function resolveColdStartSource() {
  // TODO: enforce URL precedence over persisted state
  await getInitialUrl()
  await loadPersistedNavigationState()
  return 'unresolved'
}

function HomeScreen() {
  const navigation = useNavigation()
  const [source, setSource] = useState('unknown')

  const runBootstrapPlaceholder = async () => {
    const nextSource = await resolveColdStartSource()
    setSource(nextSource)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Cold start source: {source}</Text>
      <Button title="Call bootstrap placeholder" onPress={runBootstrapPlaceholder} />
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
