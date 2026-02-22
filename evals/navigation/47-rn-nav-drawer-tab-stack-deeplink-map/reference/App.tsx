import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
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

type DetailsScreenProps = StaticScreenProps<{
  id: string
}>

function DetailsScreen({ route }: DetailsScreenProps) {
  return (
    <View style={styles.screen}>
      <Text>Deep route item: {route.params.id}</Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text>Settings</Text>
    </View>
  )
}

function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text>Unknown link fallback</Text>
    </View>
  )
}

const HomeStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: { headerShown: false },
      linking: {
        path: '',
      },
    },
    Details: {
      screen: DetailsScreen,
      options: { headerShown: false },
      linking: {
        path: 'item/:id',
      },
    },
  },
})

const MainTabs = createBottomTabNavigator({
  screens: {
    HomeTab: {
      screen: HomeStack,
      options: { headerShown: false },
    },
    SettingsTab: {
      screen: SettingsScreen,
      options: { headerShown: false },
      linking: {
        path: 'settings',
      },
    },
  },
})

const Drawer = createDrawerNavigator({
  screens: {
    MainTabs: {
      screen: MainTabs,
      options: { title: 'Main tabs' },
    },
  },
})

const Stack = createNativeStackNavigator({
  screens: {
    AppDrawer: {
      screen: Drawer,
      options: { headerShown: false },
    },
    NotFound: {
      screen: NotFoundScreen,
      linking: {
        path: '*',
      },
    },
  },
})

type StackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

const linking = {
  prefixes: [Linking.createURL('/')],
}

export default function App() {
  return <Navigation linking={linking} />
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
