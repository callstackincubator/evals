import React from 'react'
import { createStaticNavigation } from '@react-navigation/native'
import type {
  StaticParamList,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, View } from 'react-native'

const NOTIFICATIONS = [
  { id: 'n1', text: 'Welcome to the app', mentions: false, unread: false },
  { id: 'n2', text: '@you commented on a post', mentions: true, unread: true },
  { id: 'n3', text: 'Build finished successfully', mentions: false, unread: true },
  { id: 'n4', text: '@you were assigned a task', mentions: true, unread: false },
] as const

function HomeScreen() {
  const openNotificationsDefault = () => {}
  const openNotificationsMentions = () => {}
  const openNotificationsUnread = () => {}

  return (
    <View style={styles.container}>
      <Button title='Open' onPress={openNotificationsDefault} />
      <Button
        title='Open notifications (mentions)'
        onPress={openNotificationsMentions}
      />
      <Button
        title='Open notifications (unread)'
        onPress={openNotificationsUnread}
      />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  id: 'root',
  screens: {
    Home: HomeScreen,
  },
})

type RootStackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
})
