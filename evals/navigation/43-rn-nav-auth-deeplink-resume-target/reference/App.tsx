import { createContext, useContext, useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import type {
  StaticParamList,
  StaticScreenProps,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const AuthContext = createContext<{ signIn: () => void }>({ signIn: () => {} })
const SignedInContext = createContext(false)

function useIsSignedIn() {
  return useContext(SignedInContext)
}

function useIsSignedOut() {
  return !useIsSignedIn()
}

function LandingScreen() {
  return (
    <View style={styles.centered}>
      <Text>Public landing</Text>
    </View>
  )
}

function SignInScreen() {
  const { signIn } = useContext(AuthContext)

  const handleSignIn = () => {
    signIn()
  }

  return (
    <View style={styles.centered}>
      <Button title="Sign in" onPress={handleSignIn} />
    </View>
  )
}

type ProtectedDetailsProps = StaticScreenProps<{ itemId: string }>

function ProtectedDetailsScreen({ route }: ProtectedDetailsProps) {
  return (
    <View style={styles.centered}>
      <Text>Protected item: {route.params.itemId}</Text>
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  UNSTABLE_routeNamesChangeBehavior: 'lastUnhandled',
  groups: {
    SignedIn: {
      if: useIsSignedIn,
      screens: {
        Landing: LandingScreen,
        ProtectedDetails: {
          screen: ProtectedDetailsScreen,
          linking: 'details/:itemId',
        },
      },
    },
    SignedOut: {
      if: useIsSignedOut,
      screens: {
        SignIn: SignInScreen,
      },
    },
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

const linking = {
  enabled: 'auto' as const,
  prefixes: ['myapp://'],
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  const authContext = {
    signIn: () => setIsSignedIn(true),
  }

  return (
    <AuthContext.Provider value={authContext}>
      <SignedInContext.Provider value={isSignedIn}>
        <Navigation linking={linking} />
      </SignedInContext.Provider>
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
