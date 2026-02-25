import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { Button, StyleSheet, Text, View } from 'react-native'

async function selectTabPlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.copy}>Tab routes are scaffolded for this eval.</Text>
      <Button title="Call placeholder" onPress={() => selectTabPlaceholder()} />
    </View>
  )
}

function SearchScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.copy}>Three tab shell scaffold route</Text>
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.copy}>Three tab shell scaffold route</Text>
    </View>
  )
}

const Tabs = createBottomTabNavigator({
  screens: {
    Home: HomeScreen,
    Search: SearchScreen,
    Profile: ProfileScreen,
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
