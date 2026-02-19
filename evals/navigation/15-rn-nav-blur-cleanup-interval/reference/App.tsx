import React, { useState } from 'react'

import {
  createStaticNavigation,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Polling: undefined
  Other: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type PollingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Polling'>
type OtherNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Other'>

function PollingScreen() {
  const navigation = useNavigation<PollingNavigationProp>()
  const [ticks, setTicks] = useState(0)

  useFocusEffect(() => {
    const intervalId = setInterval(() => {
      setTicks((value) => value + 1)
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  })

  function handleOpenOtherScreen() {
    navigation.navigate('Other')
  }

  return (
    <View style={styles.container}>
      <Text>Polling ticks while focused: {ticks}</Text>
      <Button title='Open other screen' onPress={handleOpenOtherScreen} />
    </View>
  )
}

function OtherScreen() {
  const navigation = useNavigation<OtherNavigationProp>()

  function handleBackToPolling() {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Button title='Back to polling' onPress={handleBackToPolling} />
    </View>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>({
  screens: {
    Polling: PollingScreen,
    Other: OtherScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
