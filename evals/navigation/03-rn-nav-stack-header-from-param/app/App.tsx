import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['Alice', 'Bob']

async function resolveHeaderTitleAction() {
  // No-op
  return 'pending'
}

function PeopleScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>People</Text>
      <Text style={styles.copy}>
        Contacts are ready.
      </Text>
      <Text style={styles.copy}>Items: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Open"
        onPress={() => resolveHeaderTitleAction()}
      />
    </View>
  )
}

function PersonDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>PersonDetails</Text>
      <Text style={styles.copy}>
        More details appear here.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    People: PeopleScreen,
    PersonDetails: PersonDetailsScreen,
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
