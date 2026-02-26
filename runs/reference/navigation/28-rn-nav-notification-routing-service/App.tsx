import {
  createNavigationContainerRef,
  createStaticNavigation,
} from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StatusBar, StyleSheet, Text, View } from 'react-native'
import { StaticParamList, StaticScreenProps } from '@react-navigation/core'
import { SafeAreaProvider } from 'react-native-safe-area-context'

type NotificationPayload =
  | { type: 'thread'; threadId: string }
  | { type: 'profile'; userId: string }

type NotificationTarget = {
  name: 'MainTabs'
  params: RootStackParamList['MainTabs']
}

const notificationRouteMap: {
  [K in NotificationPayload['type']]: (
    payload: Extract<NotificationPayload, { type: K }>
  ) => NotificationTarget
} = {
  thread: (payload) => ({
    name: 'MainTabs',
    params: {
      screen: 'Messages',
      params: {
        screen: 'Thread',
        params: { threadId: payload.threadId } as never,
      },
    },
  }),
  profile: (payload) => ({
    name: 'MainTabs',
    params: {
      screen: 'Profile',
      params: {
        screen: 'Profile',
        params: {
          userId: payload.userId,
        } as never,
      },
    },
  }),
}

const navRef = createNavigationContainerRef()

function routeNotificationFromService(payload: NotificationPayload) {
  if (!navRef.isReady()) {
    return
  }

  let target
  switch (payload.type) {
    case 'thread':
      target = notificationRouteMap.thread(payload)
      break
    case 'profile':
      target = notificationRouteMap.profile(payload)
      break
    default:
      throw new Error('Unsupported payload type')
  }

  navRef.navigate(target.name, target.params)
}

function InboxScreen() {
  return (
    <View style={styles.container}>
      <Text>Inbox</Text>
    </View>
  )
}

function ThreadScreen({ route }: StaticScreenProps<{ threadId: string }>) {
  return (
    <View style={styles.container}>
      <Text>Thread: {route.params.threadId}</Text>
    </View>
  )
}

function ProfileScreen({ route }: StaticScreenProps<{ userId: string }>) {
  return (
    <View style={styles.container}>
      <Text>Profile {route.params?.userId}</Text>
    </View>
  )
}

function NotificationServicePanel() {
  return (
    <View style={styles.notificationServicePanelContainer}>
      <Button
        title="Open"
        onPress={() =>
          routeNotificationFromService({ type: 'thread', threadId: 't-55' })
        }
      />
      <Button
        title="Profile payload"
        onPress={() =>
          routeNotificationFromService({ type: 'profile', userId: 'u-8' })
        }
      />
    </View>
  )
}
type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const MessagesStack = createNativeStackNavigator({
  screens: {
    Inbox: {
      screen: InboxScreen,
      options: {
        title: 'Inbox',
      },
    },
    Thread: {
      screen: ThreadScreen,
      options: {
        title: 'Thread',
      },
    },
  },
})

const ProfileStack = createNativeStackNavigator({
  screens: {
    Profile: {
      screen: ProfileScreen,
    },
  },
})

const MainTabsNav = createBottomTabNavigator({
  screenOptions: {
    headerShown: true,
  },
  screens: {
    Messages: {
      options: { headerShown: false },
      name: 'Messages',
      screen: MessagesStack,
    },
    Profile: {
      name: 'Profile',
      options: { headerShown: false },
      screen: ProfileStack,
    },
  },
})

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    MainTabs: MainTabsNav,
  },
})

const Navigation = createStaticNavigation(RootStack)

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationServicePanel />
      <Navigation ref={navRef} />
      <StatusBar barStyle="dark-content" />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  notificationServicePanelContainer: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'space-between',
    padding: 12,
    gap: 12,
  },
  container: {
    flex: 1,
  },
})
