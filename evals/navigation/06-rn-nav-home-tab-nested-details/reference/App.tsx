import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button
        title='Open article 1001'
        onPress={() => navigation.navigate('ArticleDetails', { articleId: '1001' })}
      />
    </View>
  )
}

function ArticleDetailsScreen({ route }: { route: any }) {
  return (
    <View style={styles.container}>
      <Text>Article ID: {route.params?.articleId ?? 'missing'}</Text>
    </View>
  )
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name='HomeList' component={HomeScreen} options={{ title: 'Home' }} />
      <HomeStack.Screen name='ArticleDetails' component={ArticleDetailsScreen} />
    </HomeStack.Navigator>
  )
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name='HomeTab' component={HomeStackNavigator} options={{ title: 'Home' }} />
        <Tab.Screen name='Settings' component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
