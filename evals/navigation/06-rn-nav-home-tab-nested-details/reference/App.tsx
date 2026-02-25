import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  createStaticNavigation,
  StaticParamList,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const HomeStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    ArticleDetails: ArticleDetailsScreen,
  },
})

const TabNavigator = createBottomTabNavigator({
  screens: {
    HomeTab: { screen: HomeStack, options: { headerShown: false } },
    Settings: SettingsScreen,
  },
})

type TabNavigatorParamList = StaticParamList<typeof TabNavigator>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(TabNavigator)

function HomeScreen() {
  const navigation = useNavigation()

  const handleNavigateToArticleDetails = () =>
    navigation.navigate('HomeTab', {
      screen: 'ArticleDetails',
      params: { articleId: '1001' },
    })

  return (
    <View style={styles.container}>
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
    <View style={styles.container}>
      <Text>Article ID: {route.params.articleId}</Text>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
    </View>
  )
}

export default function Navigation06() {
  return <Navigation />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
