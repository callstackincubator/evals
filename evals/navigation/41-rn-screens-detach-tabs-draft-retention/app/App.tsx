import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { Button, StyleSheet, Text, View } from 'react-native'

async function loadDraft() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function InboxScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inbox</Text>
      <Text style={styles.copy}>
        Inbox/Compose tabs are scaffolded for detach+draft behavior.
      </Text>
      <Button title="Call placeholder" onPress={() => loadDraft()} />
    </View>
  )
}

function ComposeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Compose</Text>
      <Text style={styles.copy}>Draft retention tabs scaffold route</Text>
    </View>
  )
}

const Tabs = createBottomTabNavigator({
  screens: {
    Inbox: InboxScreen,
    Compose: ComposeScreen,
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
