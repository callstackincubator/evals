import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type DetailsSnapshot = {
  id: string
  summary: string
}

async function loadDetailsSnapshot(id: string): Promise<DetailsSnapshot> {
  // TODO: implement cancellable async details work
  return {
    id,
    summary: 'placeholder',
  }
}

function HomeScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Button title="Open details" onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  const [status, setStatus] = useState('idle')

  const runPlaceholderRequest = async () => {
    await loadDetailsSnapshot('seed')
    setStatus('details-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Text style={styles.subtitle}>Async status: {status}</Text>
      <Button title="Call async placeholder" onPress={runPlaceholderRequest} />
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
