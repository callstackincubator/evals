import { createStaticNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import {
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/core'

function FeedScreen() {
  const { navigate } = useNavigation()

  const openNotification = () => {
    navigate('NotificationsTab', {
      screen: 'NotificationDetails',
      params: { notificationId: 'n-900' },
    })
  }

  return (
    <View style={styles.container}>
      <Button title="Open" onPress={openNotification} />
    </View>
  )
}

function NotificationsListScreen() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Button
        title="Open n-101"
        onPress={() =>
          navigate('NotificationsTab', {
            screen: 'NotificationDetails',
            params: {
              notificationId: 'n-101',
            },
          })
        }
      />
    </View>
  )
}

function NotificationDetailsScreen({
  route,
}: StaticScreenProps<{ notificationId: string }>) {
  return (
    <View style={styles.container}>
      <Text>Notification: {route.params?.notificationId}</Text>
    </View>
  )
}

export default function App() {
  return <Navigation />
}

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const NotificationsNavigator = createNativeStackNavigator({
  screens: {
    NotificationsList: NotificationsListScreen,
    NotificationDetails: NotificationDetailsScreen,
  },
})

const RootStack = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    FeedTab: {
      screen: FeedScreen,
      options: { headerShown: true },
    },
    NotificationsTab: NotificationsNavigator,
  },
})

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})
