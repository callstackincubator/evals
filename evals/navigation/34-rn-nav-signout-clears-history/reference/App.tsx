import { useState } from 'react'

import { CommonActions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function SignInScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Sign in' onPress={onSignIn} />
    </View>
  )
}

function PrivateHomeScreen({ navigation, onSignOut }: { navigation: any; onSignOut: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Private Home</Text>
      <Button title='Go to account details' onPress={() => navigation.navigate('AccountDetails')} />
      <Button
        title='Sign out'
        onPress={() => {
          onSignOut()
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            }),
          )
        }}
      />
    </View>
  )
}

function AccountDetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Account details</Text>
    </View>
  )
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isSignedIn ? (
          <Stack.Screen name='SignIn'>{() => <SignInScreen onSignIn={() => setIsSignedIn(true)} />}</Stack.Screen>
        ) : (
          <>
            <Stack.Screen name='PrivateHome'>
              {(props) => <PrivateHomeScreen {...props} onSignOut={() => setIsSignedIn(false)} />}
            </Stack.Screen>
            <Stack.Screen name='AccountDetails' component={AccountDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
