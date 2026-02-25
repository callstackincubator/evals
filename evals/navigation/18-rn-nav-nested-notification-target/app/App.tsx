import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function openNotificationTargetPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function NotificationsListScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>NotificationsList</Text>
      <Text style={styles.copy}>
        Notification seed is ready for nested target behavior.
      </Text>
      <Button
        title="Call placeholder"
        onPress={() => openNotificationTargetPlaceholder()}
      />
    </View>
  )
}

function NotificationDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>NotificationDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this nested route shell.
      </Text>
    </View>
  )
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.copy}>Nested notification target scaffold route</Text>
    </View>
  )
}

const NotificationsStack = createNativeStackNavigator({
  screens: {
    NotificationsList: NotificationsListScreen,
    NotificationDetails: NotificationDetailsScreen,
  },
})

const Tabs = createBottomTabNavigator({
  screens: {
    NotificationsTab: NotificationsStack,
    Feed: FeedScreen,
  },
})

const Navigation = createStaticNavigation(Tabs)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  copy: {
    color: '#6b7280',
    textAlign: 'center',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
