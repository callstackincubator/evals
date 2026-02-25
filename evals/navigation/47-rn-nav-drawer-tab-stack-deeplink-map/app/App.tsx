import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function resolveNestedDeepLinkTargetAction() {
  // No-op
  return 'pending'
}

function HomeFeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>HomeFeed</Text>
      <Text style={styles.copy}>
        Nested routes are ready.
      </Text>
      <Button
        title="HomeFeed"
        onPress={() => resolveNestedDeepLinkTargetAction()}
      />
    </View>
  )
}

function HomeDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>HomeDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.copy}>Navigation map</Text>
    </View>
  )
}

function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>NotFound</Text>
      <Text style={styles.copy}>Unknown path fallback screen.</Text>
    </View>
  )
}

const HomeStack = createNativeStackNavigator({
  screens: {
    HomeFeed: HomeFeedScreen,
    HomeDetails: HomeDetailsScreen,
  },
})

const MainTabs = createBottomTabNavigator({
  screens: {
    HomeTab: HomeStack,
    SettingsTab: SettingsScreen,
  },
})

const MainDrawer = createDrawerNavigator({
  screens: {
    Main: MainTabs,
    Help: SettingsScreen,
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    MainDrawer,
    NotFound: NotFoundScreen,
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
