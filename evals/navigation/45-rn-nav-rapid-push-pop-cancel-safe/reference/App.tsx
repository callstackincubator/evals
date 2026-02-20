import { useCallback, useState } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Button title='Push details A' onPress={() => navigation.push('Details', { id: 'A' })} />
      <Button title='Push details B' onPress={() => navigation.push('Details', { id: 'B' })} />
    </View>
  )
}

function DetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const [status, setStatus] = useState('idle')

  useFocusEffect(
    useCallback(() => {
      let active = true
      const controller = new AbortController()
      setStatus('loading')

      const timeoutId = setTimeout(() => {
        if (active && !controller.signal.aborted) {
          setStatus(`loaded ${route.params?.id}`)
        }
      }, 800)

      return () => {
        active = false
        controller.abort()
        clearTimeout(timeoutId)
      }
    }, [route.params?.id]),
  )

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Details {route.params?.id}</Text>
      <Text>Status: {status}</Text>
      <Button title='Push next' onPress={() => navigation.push('Details', { id: `${route.params?.id}-next` })} />
      <Button title='Pop' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
