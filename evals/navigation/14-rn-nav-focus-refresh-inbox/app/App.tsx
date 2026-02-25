import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type InboxItem = {
  id: string
  title: string
}

async function refreshInboxItems(): Promise<InboxItem[]> {
  // TODO: implement deterministic focus refresh behavior
  return []
}

function InboxScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('idle')

  const runRefreshPlaceholder = async () => {
    await refreshInboxItems()
    setStatus('refresh-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inbox</Text>
      <Text style={styles.subtitle}>Refresh status: {status}</Text>
      <Button title="Call refresh placeholder" onPress={runRefreshPlaceholder} />
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
    Inbox: InboxScreen,
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
