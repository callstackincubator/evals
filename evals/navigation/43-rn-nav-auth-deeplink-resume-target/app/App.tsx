import { useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type DeferredNavigationTarget = {
  name: 'Details'
  params: { itemId: string }
}

let deferredTarget: DeferredNavigationTarget | null = null

function captureDeferredTarget(target: DeferredNavigationTarget) {
  // TODO: store deferred deep-link target while signed out
  deferredTarget = target
}

function consumeDeferredTarget() {
  // TODO: resume deferred target after authentication
  const target = deferredTarget
  deferredTarget = null
  return target
}

function LoginScreen() {
  const [status, setStatus] = useState('signed-out')

  const runResumePlaceholder = () => {
    const resumedTarget = consumeDeferredTarget()
    setStatus(resumedTarget ? 'deferred-target-found' : 'no-deferred-target')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Deferred target status: {status}</Text>
      <Button title="Consume deferred target" onPress={runResumePlaceholder} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Details</Text>
      <Button
        title="Capture deferred target"
        onPress={() => captureDeferredTarget({ name: 'Details', params: { itemId: '42' } })}
      />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Login: LoginScreen,
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
