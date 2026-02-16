import { useLayoutEffect, useState } from 'react'

import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { enableFreeze, enableScreens } from 'react-native-screens'

enableScreens(true)
enableFreeze(true)

const Stack = createNativeStackNavigator()

function HomeScreen() {
  const navigation = useNavigation()
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount((value) => value + 1)
  }

  const handleOpenDetails = () => {
    navigation.navigate('Details')
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title={`+ ${count}`} onPress={handleIncrement} />
      ),
    })
  }, [count, navigation])

  return (
    <View style={styles.home}>
      <Text>Header counter: {count}</Text>
      <Button title="Open details" onPress={handleOpenDetails} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.centered}>
      <Text>Details</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ freezeOnBlur: true }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  home: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
})
