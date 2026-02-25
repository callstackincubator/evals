import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function toggleTabBarVisibilityPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.copy}>
        Feed stack/tab routes are scaffolded for tab-bar visibility behavior.
      </Text>
      <Button
        title="Call placeholder"
        onPress={() => toggleTabBarVisibilityPlaceholder()}
      />
    </View>
  )
}

function FullScreenDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>FullScreenDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this nested route shell.
      </Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.copy}>Tab bar visibility scaffold route</Text>
    </View>
  )
}

const FeedStack = createNativeStackNavigator({
  screens: {
    Feed: FeedScreen,
    FullScreenDetails: FullScreenDetailsScreen,
  },
})

const Tabs = createBottomTabNavigator({
  screens: {
    FeedTab: FeedStack,
    Settings: SettingsScreen,
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
