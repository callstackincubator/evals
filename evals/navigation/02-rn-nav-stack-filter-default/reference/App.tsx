import React from 'react'
import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type {
  StaticParamList,
  StaticScreenProps,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const NOTIFICATIONS = [
  { id: 'n1', text: 'Welcome to the app', mentions: false, unread: false },
  { id: 'n2', text: '@you commented on a post', mentions: true, unread: true },
  { id: 'n3', text: 'Build finished successfully', mentions: false, unread: true },
  { id: 'n4', text: '@you were assigned a task', mentions: true, unread: false },
] as const

type Filter = 'all' | 'mentions' | 'unread'

function HomeScreen() {
  const navigation = useNavigation()

  const openNotificationsDefault = () => {
    navigation.navigate('Notifications', {})
  }
  const openNotificationsMentions = () => {
    navigation.navigate('Notifications', { filter: 'mentions' })
  }
  const openNotificationsUnread = () => {
    navigation.navigate('Notifications', { filter: 'unread' })
  }

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

type NotificationsScreenProps = StaticScreenProps<{
  filter?: Filter
}>

function NotificationsScreen({ route }: NotificationsScreenProps) {
  const normalizedFilter = route.params?.filter ?? 'all'

  const filteredNotifications = NOTIFICATIONS.filter((notification) => {
    if (normalizedFilter === 'all') {
      return true
    }

    if (normalizedFilter === 'mentions') {
      return notification.mentions
    }

    return notification.unread
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text>filter: {normalizedFilter}</Text>
      {filteredNotifications.map((notification) => (
        <Text key={notification.id}>{notification.text}</Text>
      ))}
    </View>
  )
}

const Stack = createNativeStackNavigator({
  id: 'root',
  screens: {
    Home: HomeScreen,
    Notifications: NotificationsScreen,
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
