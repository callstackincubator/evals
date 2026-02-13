import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Notifications: { filter?: 'all' | 'mentions' | 'unread' }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Open notifications (default)' onPress={() => navigation.navigate('Notifications')} />
      <Button
        title='Open notifications (mentions)'
        onPress={() => navigation.navigate('Notifications', { filter: 'mentions' })}
      />
    </View>
  )
}

function NotificationsScreen({ route }: { route: any }) {
  const normalizedFilter = route.params?.filter ?? 'all'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text>filter: {normalizedFilter}</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Notifications' component={NotificationsScreen} />
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
    fontSize: 20,
    fontWeight: '600',
  },
})
