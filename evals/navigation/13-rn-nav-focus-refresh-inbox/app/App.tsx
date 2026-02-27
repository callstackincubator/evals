import React, { useState } from 'react'

import {
  createStaticNavigation,
  useFocusEffect,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack'
import { StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Inbox: undefined
}

function InboxScreen() {
  const [refreshCount, setRefreshCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text>Inbox refreshes on focus: {refreshCount}</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>({
  screens: {
    Inbox: InboxScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})
