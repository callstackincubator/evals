import { useRef } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

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
      onReady={() => {
        routeNameRef.current = 'Home'
      }}
      onStateChange={(state) => {
        const routeName = state?.routes[state.index ?? 0]?.name
        if (routeName && routeNameRef.current !== routeName) {
          analytics.trackScreenView(routeName)
          routeNameRef.current = routeName
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
