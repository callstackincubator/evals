import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStaticNavigation } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'

function AccountScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>
    </View>
  )
}

function HelpScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Help</Text>
    </View>
  )
}

const Drawer = createDrawerNavigator({
  screens: {
    Account: AccountScreen,
    Help: HelpScreen,
  },
})

const Navigation = createStaticNavigation(Drawer)

export default function App() {
  return <Navigation />
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
