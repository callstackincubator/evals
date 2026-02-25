import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['id: A', 'id: B']

async function loadDetailsSnapshot() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function RequestQueueScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>RequestQueue</Text>
      <Text style={styles.copy}>
        Detail flow shell is ready for async cancellation behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button title="Call placeholder" onPress={() => loadDetailsSnapshot()} />
    </View>
  )
}

function RequestDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>RequestDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    RequestQueue: RequestQueueScreen,
    RequestDetails: RequestDetailsScreen,
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
