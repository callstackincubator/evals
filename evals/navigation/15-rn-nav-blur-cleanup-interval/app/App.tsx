import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function startPolling(onTick: () => void, intervalMs = 1000) {
  // TODO: implement focus-aware interval lifecycle
  void onTick
  void intervalMs
  return () => {}
}

function PollingScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('idle')

  const runPollingPlaceholder = () => {
    const stop = startPolling(() => {}, 1000)
    stop()
    setStatus('polling-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Polling</Text>
      <Text style={styles.subtitle}>Polling status: {status}</Text>
      <Button title="Call polling placeholder" onPress={runPollingPlaceholder} />
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
    Polling: PollingScreen,
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
