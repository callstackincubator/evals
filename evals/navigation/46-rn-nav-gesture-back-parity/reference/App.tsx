import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen({ navigation, flowState }: { navigation: any; flowState: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Flow state: {flowState}</Text>
      <Button title='Start critical flow' onPress={() => navigation.navigate('CriticalStep')} />
    </View>
  )
}

function CriticalStepScreen({ navigation, onExit }: { navigation: any; onExit: () => void }) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      onExit()
    })

    return unsubscribe
  }, [navigation, onExit])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Critical step</Text>
      <Button title='Complete and go back' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  const [flowState, setFlowState] = useState('idle')

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home'>
          {(props) => <HomeScreen {...props} flowState={flowState} />}
        </Stack.Screen>
        <Stack.Screen name='CriticalStep'>
          {(props) => (
            <CriticalStepScreen
              {...props}
              onExit={() => {
                setFlowState('exited-consistently')
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
