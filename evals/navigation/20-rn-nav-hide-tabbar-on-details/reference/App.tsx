import { createStaticNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'
import {
  getFocusedRouteNameFromRoute,
  StaticParamList,
  useNavigation,
} from '@react-navigation/core'

function HomeScreen() {
  const { navigate } = useNavigation()

  return (
    <View style={styles.container}>
      <Button title="Open details" onPress={() => navigate('Details')} />
    </View>
  )
}

function buildScreen(label: string) {
  return function Screen() {
    return (
      <View style={styles.container}>
        <Text>{label}</Text>
      </View>
    )
  }
}

const SettingsScreen = buildScreen('Settings')
const DetailsScreen = buildScreen('Full-screen details')

export default function App() {
  return <Navigation />
}

const HomeStackNavigator = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
})

const ROOT_TAB_HIDDEN_ROUTES = ['Details']

const RootStack = createBottomTabNavigator({
  screenOptions: ({ route }) => {
    const focused = getFocusedRouteNameFromRoute(route) ?? 'Home'
    const hideTabBar = ROOT_TAB_HIDDEN_ROUTES.includes(focused)

    return {
      headerShown: false,
      tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
    }
  },
  screens: {
    Main: HomeStackNavigator,
    Settings: {
      screen: SettingsScreen,
      options: {
        headerShown: true,
      },
    },
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
