import { useEffect, useState } from 'react'

import {
  createNavigationContainerRef,
  NavigationContainer,
  useRoute,
} from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Landing: undefined
  SignIn: undefined
  ProtectedDetails: { itemId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const navRef = createNavigationContainerRef<RootStackParamList>()

type ProtectedTarget = {
  name: 'ProtectedDetails'
  params: { itemId: string }
} | null

function LandingScreen({ onDeepLink }: { onDeepLink: () => void }) {
  return (
    <View style={styles.landing}>
      <Text>Public landing</Text>
      <Button title="Simulate protected deep link" onPress={onDeepLink} />
    </View>
  )
}

function SignInScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={styles.centered}>
      <Button title="Sign in" onPress={onSignIn} />
    </View>
  )
}

function ProtectedDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProtectedDetails'>>()

  return (
    <View style={styles.centered}>
      <Text>Protected item: {route.params.itemId}</Text>
    </View>
  )
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<ProtectedTarget>(null)

  const handleIncomingProtectedDeepLink = () => {
    const target: ProtectedTarget = {
      name: 'ProtectedDetails',
      params: { itemId: 'dl-99' },
    }

    if (!isSignedIn) {
      setPendingTarget(target)
      if (navRef.isReady()) {
        navRef.navigate('SignIn')
      }
      return
    }

    if (navRef.isReady()) {
      navRef.navigate(target.name, target.params)
    }
  }

  const handleSignIn = () => {
    setIsSignedIn(true)
  }

  useEffect(() => {
    if (!isSignedIn || !pendingTarget || !navRef.isReady()) {
      return
    }

    navRef.navigate(pendingTarget.name, pendingTarget.params)
    setPendingTarget(null)
  }, [isSignedIn, pendingTarget])

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator>
        <Stack.Screen name="Landing">
          {() => <LandingScreen onDeepLink={handleIncomingProtectedDeepLink} />}
        </Stack.Screen>
        <Stack.Screen name="SignIn">
          {() => <SignInScreen onSignIn={handleSignIn} />}
        </Stack.Screen>
        <Stack.Screen
          name="ProtectedDetails"
          component={ProtectedDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
