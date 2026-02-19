import { createStaticNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, Text, View } from 'react-native'
import { StaticParamList } from '@react-navigation/core'

function buildScreen(label: string) {
  return function Screen() {
    return (
      <View style={styles.container}>
        <Text>{label}</Text>
      </View>
    )
  }
}

const HomeScreen = buildScreen('Home')
const SearchScreen = buildScreen('Search')
const ProfileScreen = buildScreen('Profile')

export default function App() {
  return <Navigation />
}

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const RootStack = createBottomTabNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        lazy: true,
      },
    },
    Search: {
      screen: SearchScreen,
      options: {
        lazy: true,
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        lazy: true,
      },
    },
  },
})

const Navigation = createStaticNavigation(RootStack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
