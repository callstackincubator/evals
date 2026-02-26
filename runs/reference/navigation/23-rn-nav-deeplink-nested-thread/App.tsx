import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Linking from 'expo-linking'
import { StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text>Home</Text>
    </View>
  )
}

function MessagesScreen() {
  return (
    <View style={styles.screen}>
      <Text>Messages</Text>
    </View>
  )
}

type ThreadScreenProps = StaticScreenProps<{
  id: string
}>

function ThreadScreen({ route }: ThreadScreenProps) {
  return (
    <View style={styles.screen}>
      <Text>Thread ID: {route.params.id}</Text>
    </View>
  )
}

const MessagesStack = createNativeStackNavigator({
  screens: {
    Messages: {
      screen: MessagesScreen,
      options: { title: 'Messages' },
    },
    Thread: {
      screen: ThreadScreen,
      options: { title: 'Thread' },
      linking: {
        path: 'thread/:id',
      },
    },
  },
})

const HomeStack = createNativeStackNavigator({
  screens: {
    Home: { screen: HomeScreen, options: { title: 'Home' } },
    MessageStack: {
      screen: MessagesStack,
      options: { headerShown: false },
      linking: {
        path: 'messages',
      },
    },
  },
})

const RootTabs = createBottomTabNavigator({
  screens: {
    HomeTab: {
      screen: HomeStack,
      options: { headerShown: false },
      linking: {
        path: 'home',
      },
    },
  },
})

type RootNavigatorParamList = StaticParamList<typeof RootTabs>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(RootTabs)

const linking = { prefixes: [Linking.createURL('/')] }

export default function Navigation23() {
  return <Navigation linking={linking} />
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
