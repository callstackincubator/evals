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
  Inbox: undefined
  Details: undefined
}

type InboxNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Inbox'
>
type DetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Details'
>

function InboxScreen() {
  const navigation = useNavigation<InboxNavigationProp>()
  const [refreshCount, setRefreshCount] = useState(0)

  useFocusEffect(() => {
    setRefreshCount((count) => count + 1)
  })

  function handleGoToDetails() {
    navigation.navigate('Details')
  }

  return (
    <View style={styles.container}>
      <Text>Inbox refreshes on focus: {refreshCount}</Text>
      <Button title="Open" onPress={handleGoToDetails} />
    </View>
  )
}

function DetailsScreen() {
  const navigation = useNavigation<DetailsNavigationProp>()

  function handleBackToInbox() {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Button title="Back to inbox" onPress={handleBackToInbox} />
    </View>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>({
  screens: {
    Inbox: InboxScreen,
    Details: DetailsScreen,
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
