import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStaticNavigation } from '@react-navigation/native'
import { Button, StyleSheet, Text, View } from 'react-native'

async function openDrawerRouteAction() {
  // No-op
  return 'pending'
}

function AccountScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.copy}>
        Account and help screens are ready.
      </Text>
      <Button
        title="Account"
        onPress={() => openDrawerRouteAction()}
      />
    </View>
  )
}

function HelpScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Help</Text>
      <Text style={styles.copy}>Drawer content</Text>
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
