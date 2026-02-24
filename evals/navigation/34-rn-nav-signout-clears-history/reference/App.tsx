import { createContext, useContext, useState } from 'react'

import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import { StaticParamList, useNavigation } from '@react-navigation/core'

function SignInScreen() {
  const { signIn } = useContext(AuthContext)
  return (
    <View style={styles.signInContainer}>
      <Button title="Sign in" onPress={signIn} />
    </View>
  )
}

function PrivateHomeScreen() {
  const { navigate } = useNavigation()
  const { signOut } = useAuthContext()

  const onSignOut = () => {
    signOut()
  }

  return (
    <View style={styles.privateHomeScreenContainer}>
      <Text>Private Home</Text>
      <Button
        title="Go to account details"
        onPress={() => navigate('AccountDetailsScreen')}
      />
      <Button title="Sign out" onPress={onSignOut} />
    </View>
  )
}

function AccountDetailsScreen() {
  return (
    <View style={styles.accountDetailsContainer}>
      <Text>Account details</Text>
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

const RootStack = createNativeStackNavigator({
  groups: {
    SignedIn: {
      if: useIsSignedIn,
      screens: {
        PrivateHomeScreen: {
          screen: PrivateHomeScreen,
        },
        AccountDetailsScreen: {
          screen: AccountDetailsScreen,
        },
      },
    },
    SignedOut: {
      if: useIsSignedOut,
      screens: {
        SignInScreen: {
          screen: SignInScreen,
        },
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

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        signIn: () => setIsSignedIn(true),
        signOut: () => setIsSignedIn(false),
      }}
    >
      <Navigation />
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  accountDetailsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateHomeScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
