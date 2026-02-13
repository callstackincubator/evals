import { useRef } from 'react'

import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()
const navigationRef = createNavigationContainerRef()

const analytics = {
  trackScreenView: (routeName: string) => {
    console.log('screen_view', routeName)
  },
}

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Go to details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Details</Text>
      <Button title='Go back' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  const routeNameRef = useRef<string>()

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const currentRoute = navigationRef.getCurrentRoute()?.name
        if (currentRoute) {
          analytics.trackScreenView(currentRoute)
          routeNameRef.current = currentRoute
        }
      }}
      onStateChange={() => {
        const currentRoute = navigationRef.getCurrentRoute()?.name
        if (currentRoute && routeNameRef.current !== currentRoute) {
          analytics.trackScreenView(currentRoute)
          routeNameRef.current = currentRoute
        }
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Details' component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
