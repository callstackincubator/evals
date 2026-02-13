import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  CriticalStep: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  flowState: string
}

function HomeScreen({ navigation, flowState }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text>Flow state: {flowState}</Text>
      <Button title='Start critical flow' onPress={() => navigation.navigate('CriticalStep')} />
    </View>
  )
}

type CriticalStepScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CriticalStep'
> & {
  onExit: () => void
}

function CriticalStepScreen({ navigation, onExit }: CriticalStepScreenProps) {
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      onExit()
    })

    return unsubscribe
  }, [navigation, onExit])

  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
