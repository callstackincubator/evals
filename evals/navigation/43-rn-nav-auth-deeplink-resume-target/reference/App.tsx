import { useEffect, useState } from 'react'

import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()
const navRef = createNavigationContainerRef()

type ProtectedTarget = { name: 'ProtectedDetails'; params: { itemId: string } } | null

function LandingScreen({ onDeepLink }: { onDeepLink: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Public landing</Text>
      <Button title='Simulate protected deep link' onPress={onDeepLink} />
    </View>
  )
}

function SignInScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Sign in' onPress={onSignIn} />
    </View>
  )
}

function ProtectedDetailsScreen({ route }: { route: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Protected item: {route.params?.itemId}</Text>
    </View>
  )
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [pendingTarget, setPendingTarget] = useState<ProtectedTarget>(null)

  const handleIncomingProtectedDeepLink = () => {
    const target: ProtectedTarget = { name: 'ProtectedDetails', params: { itemId: 'dl-99' } }

    if (!isSignedIn) {
      setPendingTarget(target)
      if (navRef.isReady()) {
        navRef.navigate('SignIn' as never)
      }
      return
    }

    if (navRef.isReady()) {
      navRef.navigate(target.name as never, target.params as never)
    }
  }

  useEffect(() => {
    if (!isSignedIn || !pendingTarget || !navRef.isReady()) {
      return
    }

    navRef.navigate(pendingTarget.name as never, pendingTarget.params as never)
    setPendingTarget(null)
  }, [isSignedIn, pendingTarget])

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator>
        <Stack.Screen name='Landing'>
          {() => <LandingScreen onDeepLink={handleIncomingProtectedDeepLink} />}
        </Stack.Screen>
        <Stack.Screen name='SignIn'>{() => <SignInScreen onSignIn={() => setIsSignedIn(true)} />}</Stack.Screen>
        <Stack.Screen name='ProtectedDetails' component={ProtectedDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
