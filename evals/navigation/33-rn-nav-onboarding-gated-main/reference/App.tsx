import { useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Onboarding step</Text>
      <Button title='Finish onboarding' onPress={onComplete} />
    </View>
  )
}

function MainHomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Main app home</Text>
    </View>
  )
}

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {onboardingComplete ? (
          <Stack.Screen name='MainHome' component={MainHomeScreen} />
        ) : (
          <Stack.Screen name='Onboarding'>
            {() => <WelcomeScreen onComplete={() => setOnboardingComplete(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
