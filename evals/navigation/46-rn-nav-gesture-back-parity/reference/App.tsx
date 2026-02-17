import { createContext, useContext, useEffect, useState } from 'react'

import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  CriticalStep: undefined
}

type FlowContextValue = {
  flowState: string
  onCriticalStepExit: () => void
}

const FlowContext = createContext<FlowContextValue | null>(null)

function useFlow() {
  const ctx = useContext(FlowContext)
  if (!ctx) throw new Error('useFlow must be used within FlowProvider')
  return ctx
}

function HomeScreen() {
  const navigation = useNavigation<NativeStackScreenProps<RootStackParamList, 'Home'>['navigation']>()
  const { flowState } = useFlow()
  const goToCriticalStep = () => navigation.navigate('CriticalStep')
  return (
    <View style={styles.container}>
      <Text>Flow state: {flowState}</Text>
      <Button title='Start critical flow' onPress={goToCriticalStep} />
    </View>
  )
}

function CriticalStepScreen() {
  const navigation = useNavigation<
    NativeStackScreenProps<RootStackParamList, 'CriticalStep'>['navigation']
  >()
  const { onCriticalStepExit } = useFlow()
  const goBack = () => navigation.goBack()
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      onCriticalStepExit()
    })
    return unsubscribe
  }, [navigation, onCriticalStepExit])

  return (
    <View style={styles.container}>
      <Text>Critical step</Text>
      <Button title='Complete and go back' onPress={goBack} />
    </View>
  )
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
    },
    CriticalStep: {
      screen: CriticalStepScreen,
    },
  },
})

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  const [flowState, setFlowState] = useState('idle')

  return (
    <FlowContext.Provider
      value={{
        flowState,
        onCriticalStepExit: () => setFlowState('exited-consistently'),
      }}
    >
      <Navigation />
    </FlowContext.Provider>
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