import { useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function SignInScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={styles.container}>
      <Text>Auth flow</Text>
      <Button title='Sign in' onPress={onSignIn} />
    </View>
  )
}

function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text>Forgot password</Text>
    </View>
  )
}

function HomeScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={styles.container}>
      <Text>Main app flow</Text>
      <Button title='Sign out' onPress={onSignOut} />
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
    </View>
  )
}

export default function App() {
  const [signedIn, setSignedIn] = useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {signedIn ? (
          <>
            <Stack.Screen name='Home'>{() => <HomeScreen onSignOut={() => setSignedIn(false)} />}</Stack.Screen>
            <Stack.Screen name='Settings' component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name='SignIn'>{() => <SignInScreen onSignIn={() => setSignedIn(true)} />}</Stack.Screen>
            <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
          </>
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
    padding: 24,
  },
})
