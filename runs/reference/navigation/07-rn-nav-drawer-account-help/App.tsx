import { createDrawerNavigator } from '@react-navigation/drawer'
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'

function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text>Account section</Text>
    </View>
  )
}

function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text>Help section</Text>
    </View>
  )
}

const Drawer = createDrawerNavigator({
  screens: {
    Account: AccountScreen,
    Help: HelpScreen,
  },
})

type DrawerParamList = StaticParamList<typeof Drawer>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends DrawerParamList {}
  }
}

const Navigation = createStaticNavigation(Drawer)

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
