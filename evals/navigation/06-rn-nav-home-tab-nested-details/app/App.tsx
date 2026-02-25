import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

async function openArticlePlaceholder() {
  // TODO: implement navigation behavior for this eval
  return 'pending'
}

function HomeFeedScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>HomeFeed</Text>
      <Text style={styles.copy}>
        Article seed is ready for nested Home flow behavior.
      </Text>
      <Button
        title="Call placeholder"
        onPress={() => openArticlePlaceholder()}
      />
    </View>
  )
}

function ArticleDetailsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ArticleDetails</Text>
      <Text style={styles.copy}>
        Implement eval behavior from this nested route shell.
      </Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.copy}>Nested Home tab scaffold route</Text>
    </View>
  )
}

const HomeStack = createNativeStackNavigator({
  screens: {
    HomeFeed: HomeFeedScreen,
    ArticleDetails: ArticleDetailsScreen,
  },
})

const Tabs = createBottomTabNavigator({
  screens: {
    HomeTab: HomeStack,
    Settings: SettingsScreen,
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
