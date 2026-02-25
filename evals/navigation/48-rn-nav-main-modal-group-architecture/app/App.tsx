import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['main-group', 'modal-group']

async function buildRouteGroupsPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function MainBoardScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>MainBoard</Text>
      <Text style={styles.copy}>
        Main and modal route shells are scaffolded for grouping behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Call placeholder"
        onPress={() => buildRouteGroupsPlaceholder()}
      />
    </View>
  )
}

function MainDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>MainDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

function ComposeModalScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ComposeModal</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    MainBoard: MainBoardScreen,
    MainDetails: MainDetailsScreen,
    ComposeModal: ComposeModalScreen,
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
