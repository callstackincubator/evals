import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function resolveNotificationPayloadPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.copy}>
        Main tabs and root stack shell are scaffolded for payload routing
        behavior.
      </Text>
      <Button
        title="Call placeholder"
        onPress={() => resolveNotificationPayloadPlaceholder()}
      />
    </View>
  )
}

function MessagesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.copy}>Notification routing scaffold route</Text>
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.copy}>Notification routing scaffold route</Text>
    </View>
  )
}

function NotificationTargetScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>NotificationTarget</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this modal route shell.
      </Text>
    </View>
  )
}

const Tabs = createBottomTabNavigator({
  screens: {
    Feed: FeedScreen,
    Messages: MessagesScreen,
    Profile: ProfileScreen,
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    MainTabs: Tabs,
    NotificationTarget: NotificationTargetScreen,
  },
})

const Navigation = createStaticNavigation(RootStack)

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
