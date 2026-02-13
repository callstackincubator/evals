import { useLayoutEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'
import { enableFreeze, enableScreens } from 'react-native-screens'

enableScreens(true)
enableFreeze(true)

const Stack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  const [count, setCount] = useState(0)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title={`+ ${count}`} onPress={() => setCount((value) => value + 1)} />,
    })
  }, [count, navigation])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text>Header counter: {count}</Text>
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ freezeOnBlur: true }}>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
