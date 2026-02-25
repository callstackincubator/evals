import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const SEED_ITEMS = ['NAV_STATE_V1']

async function persistLastRoutePlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function LibraryHomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>LibraryHome</Text>
      <Text style={styles.copy}>
        State key seed is ready for restore behavior.
      </Text>
      <Text style={styles.copy}>Seed: {SEED_ITEMS.join(', ')}</Text>
      <Button
        title="Call placeholder"
        onPress={() => persistLastRoutePlaceholder()}
      />
    </View>
  )
}

function LibraryDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>LibraryDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this route shell.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    LibraryHome: LibraryHomeScreen,
    LibraryDetails: LibraryDetailsScreen,
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
