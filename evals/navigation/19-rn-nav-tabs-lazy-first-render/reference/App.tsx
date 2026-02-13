import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, Text, View } from 'react-native'

const Tab = createBottomTabNavigator()

function buildScreen(label: string) {
  return function Screen() {
    return (
      <View style={styles.container}>
        <Text>{label}</Text>
      </View>
    )
  }
}

const HomeScreen = buildScreen('Home')
const SearchScreen = buildScreen('Search')
const ProfileScreen = buildScreen('Profile')

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName='Home'
        screenOptions={{
          lazy: true,
        }}
      >
        <Tab.Screen name='Home' component={HomeScreen} />
        <Tab.Screen name='Search' component={SearchScreen} />
        <Tab.Screen name='Profile' component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
