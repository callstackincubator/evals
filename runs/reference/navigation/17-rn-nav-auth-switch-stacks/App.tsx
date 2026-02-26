import { createContext, useContext, useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { StaticParamList } from '@react-navigation/core'

function SignInScreen() {
  const { signIn } = useAuthContext()

  return (
    <View style={styles.container}>
      <Text>Auth flow</Text>
      <Button title="Open" onPress={signIn} />
    </View>
  )
}

function HomeScreen() {
  const { signOut } = useAuthContext()

  return (
    <View style={styles.container}>
      <Text>Main app flow</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  )
}

const AuthContext = createContext({
  isSignedIn: false,
  signIn: (_user: object) => {},
  signOut: () => {},
})

function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('AuthContext is not attached to any provider')
  }

  return context
}

function useIsSignedIn() {
  return useAuthContext().isSignedIn
}

function useIsSignedOut() {
  return !useIsSignedIn()
}

export default function App() {
  const [signedIn, setSignedIn] = useState(false)

  const authContextValue = {
    isSignedIn: signedIn,
    signIn: () => setSignedIn(true),
    signOut: () => setSignedIn(false),
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Navigation />
    </AuthContext.Provider>
  )
}

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      if: useIsSignedIn,
    },
    SignIn: {
      screen: SignInScreen,
      if: useIsSignedOut,
    },
  },
})

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})
