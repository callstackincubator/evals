import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['Standup notes', 'Release checklist']

async function openComposeModalAction() {
  // No-op
  return 'pending'
}

function NotesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notes</Text>
      <Text style={styles.copy}>
        Recent notes are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => openComposeModalAction()}
      />
    </View>
  )
}

function ComposeNoteScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ComposeNote</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Notes: NotesScreen,
    ComposeNote: ComposeNoteScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

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
