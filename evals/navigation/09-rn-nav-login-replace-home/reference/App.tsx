import React, { useContext, useState } from 'react'

import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type AuthContextValue = {
  isSignedIn: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const useAuthContext = (): AuthContextValue => {
  const authContext = useContext(AuthContext)

  if (authContext === undefined) {
    throw new Error('Auth context not provided')
  }

  return authContext
}

const useIsSignedIn = () => {
  const { isSignedIn } = useAuthContext()
  return isSignedIn
}

const useIsSignedOut = () => !useIsSignedIn()

function LoginScreen() {
  const { signIn } = useAuthContext()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button title="Sign in" onPress={signIn} />
    </View>
  )
}

function HomeScreen() {
  const { signOut } = useAuthContext()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Login: {
      if: useIsSignedOut,
      screen: LoginScreen,
    },
    Home: { if: useIsSignedIn, screen: HomeScreen },
  },
})

type StackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  const signIn = () => setIsSignedIn(true)
  const signOut = () => setIsSignedIn(false)

  return (
    <AuthContext value={{ isSignedIn, signIn, signOut }}>
      <Navigation />
    </AuthContext>
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
