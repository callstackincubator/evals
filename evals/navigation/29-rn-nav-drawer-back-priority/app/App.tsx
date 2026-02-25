import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function prioritizeDrawerBackAction() {
  // No-op
  return 'pending'
}

function DashboardScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.copy}>
        Drawer and detail routes are ready.
      </Text>
      <Button
        title="Open"
        onPress={() => prioritizeDrawerBackAction()}
      />
    </View>
  )
}

function ConversationDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ConversationDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

function HelpScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Help</Text>
      <Text style={styles.copy}>Help and support</Text>
    </View>
  )
}

const MainStack = createNativeStackNavigator({
  screens: {
    Dashboard: DashboardScreen,
    ConversationDetails: ConversationDetailsScreen,
  },
})

const RootDrawer = createDrawerNavigator({
  screens: {
    Main: MainStack,
    Help: HelpScreen,
  },
})

const Navigation = createStaticNavigation(RootDrawer)

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
