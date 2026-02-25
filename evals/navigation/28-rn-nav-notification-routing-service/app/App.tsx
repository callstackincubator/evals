import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  createNavigationContainerRef,
  createStaticNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

type NotificationPayload =
  | { type: 'thread'; threadId: string }
  | { type: 'profile'; userId: string }

const navRef = createNavigationContainerRef()

function routeNotificationFromService(payload: NotificationPayload) {
  // TODO: map payload type to nested route and navigate via root ref
  void payload

  if (!navRef.isReady()) {
    return 'nav-not-ready'
  }

  return 'not-implemented'
}

function MessagesHomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Messages</Text>
    </View>
  )
}

function ThreadScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Thread</Text>
    </View>
  )
}

function ProfileHomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
    </View>
  )
}

function ServiceControlsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.subtitle}>Notification routing service scaffold</Text>
      <Button
        title="Call thread routing placeholder"
        onPress={() => routeNotificationFromService({ type: 'thread', threadId: 't-1' })}
      />
      <Button
        title="Call profile routing placeholder"
        onPress={() => routeNotificationFromService({ type: 'profile', userId: 'u-2' })}
      />
    </View>
  )
}

const MessagesStack = createNativeStackNavigator({
  screens: {
    Inbox: MessagesHomeScreen,
    Thread: ThreadScreen,
  },
})

const ProfileStack = createNativeStackNavigator({
  screens: {
    ProfileHome: ProfileHomeScreen,
  },
})

const MainTabs = createBottomTabNavigator({
  screens: {
    Messages: MessagesStack,
    Profile: ProfileStack,
    ServiceControls: ServiceControlsScreen,
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    MainTabs,
  },
})

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return <Navigation ref={navRef} />
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
