import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStaticNavigation, StaticScreenProps } from '@react-navigation/native'
import { Button, StyleSheet, Text, View } from 'react-native'

function HomeFeedScreen() {
  const handleNavigateToArticleDetails = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>HomeFeed</Text>
      <Text style={styles.copy}>Latest stories</Text>
      <Button
        title="Open"
        onPress={handleNavigateToArticleDetails}
      />
    </View>
  )
}

type ArticleDetailsScreenProps = StaticScreenProps<{
  articleId: string
}>

function ArticleDetailsScreen({ route }: ArticleDetailsScreenProps) {
  return (
    <View style={styles.screen}>
      <Text>Article ID: {route.params.articleId}</Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.copy}>Account settings</Text>
    </View>
  )
}

const TabNavigator = createBottomTabNavigator({
  id: "bottom-tab",
  screens: {
    HomeTab: HomeFeedScreen,
    Settings: SettingsScreen,
  },
})

const Navigation = createStaticNavigation(TabNavigator)

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
