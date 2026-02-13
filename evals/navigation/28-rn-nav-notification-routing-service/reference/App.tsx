import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, View } from 'react-native'

type NotificationPayload =
  | { type: 'thread'; threadId: string }
  | { type: 'profile'; userId: string }

type RootStackParamList = {
  MainTabs: {
    screen: 'MessagesTab' | 'ProfileTab'
    params?: any
  }
}

const navRef = createNavigationContainerRef<RootStackParamList>()
const RootStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()
const MessagesStack = createNativeStackNavigator()

const notificationRouteMap: Record<NotificationPayload['type'], (payload: any) => any> = {
  thread: (payload: { threadId: string }) => ({
    name: 'MainTabs',
    params: {
      screen: 'MessagesTab',
      params: {
        screen: 'Thread',
        params: { threadId: payload.threadId },
      },
    },
  }),
  profile: (payload: { userId: string }) => ({
    name: 'MainTabs',
    params: {
      screen: 'ProfileTab',
      params: { userId: payload.userId },
    },
  }),
}

function routeNotificationFromService(payload: NotificationPayload) {
  if (!navRef.isReady()) {
    return
  }

  const target = notificationRouteMap[payload.type](payload)
  navRef.navigate(target.name, target.params)
}

function InboxScreen() {
  return <View style={{ flex: 1 }} />
}

function ThreadScreen() {
  return <View style={{ flex: 1 }} />
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name='Inbox' component={InboxScreen} />
      <MessagesStack.Screen name='Thread' component={ThreadScreen} />
    </MessagesStack.Navigator>
  )
}

function ProfileScreen() {
  return <View style={{ flex: 1 }} />
}

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='MessagesTab' component={MessagesNavigator} options={{ headerShown: false, title: 'Messages' }} />
      <Tab.Screen name='ProfileTab' component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  )
}

function NotificationServicePanel() {
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
      <Button title='Thread payload' onPress={() => routeNotificationFromService({ type: 'thread', threadId: 't-55' })} />
      <Button title='Profile payload' onPress={() => routeNotificationFromService({ type: 'profile', userId: 'u-8' })} />
    </View>
  )
}

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NotificationServicePanel />
      <View style={{ flex: 1 }}>
        <NavigationContainer ref={navRef}>
          <RootStack.Navigator>
            <RootStack.Screen name='MainTabs' component={Tabs} options={{ headerShown: false }} />
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </View>
  )
}
