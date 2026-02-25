import { useState } from 'react'

import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function performSignOut() {
  // TODO: clear auth state and secure data
  return { signedOut: false }
}

function HomeScreen() {
  const navigation = useNavigation()
  const [status, setStatus] = useState('signed-in')

  const runSignOutPlaceholder = async () => {
    await performSignOut()
    setStatus('signout-placeholder-called')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>App Home</Text>
      <Text style={styles.subtitle}>Auth status: {status}</Text>
      <Button title="Call sign-out placeholder" onPress={runSignOutPlaceholder} />
      <Button title="Open details" onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Auth Screen</Text>
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
