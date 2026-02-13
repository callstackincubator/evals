import { useCallback } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createDrawerNavigator, useDrawerStatus } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BackHandler, Button, StyleSheet, Text, View } from 'react-native'

const Drawer = createDrawerNavigator()
const Stack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  const drawerStatus = useDrawerStatus()

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (drawerStatus === 'open') {
          navigation.getParent()?.closeDrawer()
          return true
        }

        return false
      })

      return () => subscription.remove()
    }, [drawerStatus, navigation]),
  )

  return (
    <View style={styles.container}>
      <Text>Home screen</Text>
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.container}>
      <Text>Details screen</Text>
    </View>
  )
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Details' component={DetailsScreen} />
    </Stack.Navigator>
  )
}

function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text>Help</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name='Main' component={MainStack} options={{ headerShown: false }} />
        <Drawer.Screen name='Help' component={HelpScreen} />
      </Drawer.Navigator>
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
