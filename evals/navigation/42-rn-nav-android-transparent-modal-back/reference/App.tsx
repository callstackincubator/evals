import { useCallback } from 'react'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BackHandler, Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Open transparent modal' onPress={() => navigation.navigate('TransparentModal')} />
    </View>
  )
}

function TransparentModalScreen({ navigation }: { navigation: any }) {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.goBack()
        return true
      })

      return () => subscription.remove()
    }, [navigation]),
  )

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ padding: 24, backgroundColor: 'white', borderRadius: 12, minWidth: 240, gap: 10 }}>
        <Text>Transparent modal content</Text>
        <Button title='Dismiss' onPress={() => navigation.goBack()} />
      </View>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen
          name='TransparentModal'
          component={TransparentModalScreen}
          options={{ presentation: 'transparentModal', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
