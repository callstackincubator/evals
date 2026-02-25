import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { Button, StyleSheet, Text, View } from 'react-native'

async function markTabRenderAction() {
  // No-op
  return 'pending'
}

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.copy}>
        Tabs are ready.
      </Text>
      <Button
        title="Home"
        onPress={() => markTabRenderAction()}
      />
    </View>
  )
}

function SearchScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.copy}>Tab content</Text>
    </View>
  )
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.copy}>Tab content</Text>
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
