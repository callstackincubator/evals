import { useLayoutEffect } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Details: { name: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Open Alice' onPress={() => navigation.navigate('Details', { name: 'Alice' })} />
      <Button title='Open Bob' onPress={() => navigation.navigate('Details', { name: 'Bob' })} />
    </View>
  )
}

function DetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const name = route.params?.name ?? 'Unknown'

  useLayoutEffect(() => {
    navigation.setOptions({ title: name })
  }, [navigation, name])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details for {name}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
})
