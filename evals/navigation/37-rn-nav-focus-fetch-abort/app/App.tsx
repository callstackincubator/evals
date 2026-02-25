import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type FeedResponse = {
  label: string
}

async function fetchFeedSnapshot(signal?: AbortSignal): Promise<FeedResponse> {
  // TODO: implement focus-scoped request and cancellation
  void signal
  return { label: 'placeholder' }
}

function FeedScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('idle')

  const runFetchPlaceholder = async () => {
    await fetchFeedSnapshot()
    setStatus('fetch-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.subtitle}>Fetch status: {status}</Text>
      <Button title="Call fetch placeholder" onPress={runFetchPlaceholder} />
      <Button title="Open details" onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Feed: FeedScreen,
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
