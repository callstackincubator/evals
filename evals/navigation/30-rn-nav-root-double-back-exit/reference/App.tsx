import { useCallback, useRef } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Alert, BackHandler, Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()
const EXIT_WINDOW_MS = 2000

function HomeScreen({ navigation }: { navigation: any }) {
  const lastBackPressRef = useRef(0)

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        const now = Date.now()

        if (now - lastBackPressRef.current < EXIT_WINDOW_MS) {
          BackHandler.exitApp()
          return true
        }

        lastBackPressRef.current = now
        Alert.alert('Press back again to exit')
        return true
      })

      return () => subscription.remove()
    }, []),
  )

  return (
    <View style={styles.container}>
      <Text>Root screen</Text>
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text>Details</Text>
      <Button title='Back to root' onPress={() => navigation.goBack()} />
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
})
