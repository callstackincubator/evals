import { useCallback, useState } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function FeedScreen({ navigation }: { navigation: any }) {
  const [status, setStatus] = useState('idle')

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController()
      setStatus('loading')

      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          setStatus('loaded')
        }
      }, 1000)

      return () => {
        controller.abort()
        clearTimeout(timeoutId)
      }
    }, []),
  )

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Fetch status: {status}</Text>
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Back to feed' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Feed' component={FeedScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
