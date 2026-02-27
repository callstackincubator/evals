import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  )
}

function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text>Search</Text>
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text>Profile</Text>
    </View>
  )
}

const TabNavigator = createBottomTabNavigator({
  id: 'root',
  initialRouteName: 'Home',
  screens: {
    Home: HomeScreen,
    Search: SearchScreen,
    Profile: ProfileScreen,
  },
})

type TabNavigatorParamList = StaticParamList<typeof TabNavigator>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(TabNavigator)

export default function App() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
