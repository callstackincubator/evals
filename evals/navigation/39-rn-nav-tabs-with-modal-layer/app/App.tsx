import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function openComposeModalPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.copy}>
        Tabs and modal route shells are scaffolded for this eval.
      </Text>
      <Button
        title="Call placeholder"
        onPress={() => openComposeModalPlaceholder()}
      />
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.copy}>Tabs with modal layer scaffold route</Text>
    </View>
  )
}

function ComposeModalScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ComposeModal</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this modal route shell.
      </Text>
    </View>
  )
}

const Tabs = createBottomTabNavigator({
  screens: {
    Feed: FeedScreen,
    Profile: ProfileScreen,
  },
})

const RootStack = createNativeStackNavigator({
  screens: {
    MainTabs: Tabs,
    ComposeModal: ComposeModalScreen,
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
