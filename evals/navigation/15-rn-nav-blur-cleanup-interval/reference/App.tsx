import { useCallback, useState } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function PollingScreen({ navigation }: { navigation: any }) {
  const [ticks, setTicks] = useState(0)

  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(() => {
        setTicks((value) => value + 1)
      }, 1000)

      return () => {
        clearInterval(intervalId)
      }
    }, []),
  )

  return (
    <View style={styles.container}>
      <Text>Polling ticks while focused: {ticks}</Text>
      <Button title='Open other screen' onPress={() => navigation.navigate('Other')} />
    </View>
  )
}

function OtherScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Back to polling' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Polling' component={PollingScreen} />
        <Stack.Screen name='Other' component={OtherScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
