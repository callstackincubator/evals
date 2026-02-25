import React from 'react'
import { createStaticNavigation, useNavigation } from '@react-navigation/native'
import type {
  StaticScreenProps,
  StaticParamList,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  const navigation = useNavigation()

  const openNotificationsDefault = () => {
    navigation.navigate('Notifications')
  }
  const openNotificationsMentions = () => {
    navigation.navigate('Notifications', { filter: 'mentions' })
  }
  return (
    <View style={styles.container}>
      <Button
        title="Open"
        onPress={openNotificationsDefault}
      />
      <Button
        title="Open notifications (mentions)"
        onPress={openNotificationsMentions}
      />
    </View>
  )
}

type NotificationsScreenProps = StaticScreenProps<{
  filter?: 'all' | 'mentions' | 'unread'
}>

function NotificationsScreen({ route }: NotificationsScreenProps) {
  const normalizedFilter = route.params?.filter ?? 'all'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text>filter: {normalizedFilter}</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
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
