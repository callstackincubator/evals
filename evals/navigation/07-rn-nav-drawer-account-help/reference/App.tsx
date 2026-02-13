import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { StyleSheet, Text, View } from 'react-native'

const Drawer = createDrawerNavigator()

function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text>Account section</Text>
    </View>
  )
}

function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text>Help section</Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName='Account'>
        <Drawer.Screen name='Account' component={AccountScreen} />
        <Drawer.Screen name='Help' component={HelpScreen} />
      </Drawer.Navigator>
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
