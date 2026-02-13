import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Profile: { userId?: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: '',
      Profile: {
        path: 'profile/:userId',
        parse: {
          userId: (value: string) => value.trim(),
        },
      },
    },
  },
}

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Valid profile 42' onPress={() => navigation.navigate('Profile', { userId: '42' })} />
      <Button title='Invalid profile x' onPress={() => navigation.navigate('Profile', { userId: 'x' })} />
    </View>
  )
}

function ProfileScreen({ route }: { route: any }) {
  const normalizedId = route.params?.userId ?? ''
  const isValid = /^\d+$/.test(normalizedId)

  return (
    <View style={styles.container}>
      {isValid ? <Text>Profile userId: {normalizedId}</Text> : <Text>Invalid profile link</Text>}
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Profile' component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})
