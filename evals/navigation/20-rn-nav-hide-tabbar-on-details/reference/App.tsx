import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Open details' onPress={() => navigation.navigate('Details')} />
    </View>
  )
}

function DetailsScreen() {
  return (
    <View style={styles.container}>
      <Text>Full-screen details</Text>
    </View>
  )
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name='Home' component={HomeScreen} />
      <HomeStack.Screen name='Details' component={DetailsScreen} />
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
        <Tab.Screen
          name='Main'
          component={HomeStackNavigator}
          options={({ route }) => {
            const focused = getFocusedRouteNameFromRoute(route) ?? 'Home'
            const hideTabBar = focused === 'Details'

            return {
              headerShown: false,
              tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
            }
          }}
        />
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
