import { useState } from 'react'

import { CommonActions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function LoginScreen({ navigation, onLogin }: { navigation: any; onLogin: () => void }) {
  const handleLogin = () => {
    onLogin()
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button title='Sign in' onPress={handleLogin} />
    </View>
  )
}

function HomeScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Button title='Sign out' onPress={onLogout} />
    </View>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerBackVisible: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name='Login'>
            {(props) => <LoginScreen {...props} onLogin={() => setIsAuthenticated(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name='Home'>
            {() => <HomeScreen onLogout={() => setIsAuthenticated(false)} />}
          </Stack.Screen>
        )}
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
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
})
