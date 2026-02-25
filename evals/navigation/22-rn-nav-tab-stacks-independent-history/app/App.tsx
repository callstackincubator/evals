import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function preserveTabStackHistoryAction() {
  // No-op
  return 'pending'
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.copy}>Recent activity</Text>
      <Button
        title="Open"
        onPress={() => preserveTabStackHistoryAction()}
      />
    </View>
  )
}

function FeedDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>FeedDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const FeedStack = createNativeStackNavigator({
  screens: {
    Feed: FeedScreen,
    FeedDetails: FeedDetailsScreen,
  },
})

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.copy}>Preferences</Text>
    </View>
  )
}

function SettingsDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>SettingsDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const SettingsStack = createNativeStackNavigator({
  screens: {
    Settings: SettingsScreen,
    SettingsDetails: SettingsDetailsScreen,
  },
})

const Tabs = createBottomTabNavigator({
  screens: {
    FeedTab: FeedStack,
    SettingsTab: SettingsStack,
  },
})

const Navigation = createStaticNavigation(Tabs)

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
