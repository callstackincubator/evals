import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function openThreadFromLinkPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function FeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>
      <Text style={styles.copy}>
        Messages routes are scaffolded for nested thread deep-link behavior.
      </Text>
      <Button
        title="Call placeholder"
        onPress={() => openThreadFromLinkPlaceholder()}
      />
    </View>
  )
}

function FeedDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>FeedDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

function MessagesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.copy}>Nested thread scaffold route.</Text>
    </View>
  )
}

function ThreadScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Thread</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const HomeStack = createNativeStackNavigator({
  screens: {
    Feed: FeedScreen,
    FeedDetails: FeedDetailsScreen,
  },
})

const MessagesStack = createNativeStackNavigator({
  screens: {
    Messages: MessagesScreen,
    Thread: ThreadScreen,
  },
})

const Tabs = createBottomTabNavigator({
  screens: {
    HomeTab: HomeStack,
    MessagesTab: MessagesStack,
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
