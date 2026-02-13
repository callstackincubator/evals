import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Tab = createBottomTabNavigator()
const FeedStack = createNativeStackNavigator()
const SettingsStack = createNativeStackNavigator()

function FeedHome({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text>Feed root</Text>
      <Button title='Open feed details' onPress={() => navigation.navigate('FeedDetails')} />
    </View>
  )
}

function FeedDetails() {
  return (
    <View style={styles.container}>
      <Text>Feed details</Text>
    </View>
  )
}

function SettingsHome({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text>Settings root</Text>
      <Button title='Open profile settings' onPress={() => navigation.navigate('ProfileSettings')} />
    </View>
  )
}

function ProfileSettings() {
  return (
    <View style={styles.container}>
      <Text>Profile settings</Text>
    </View>
  )
}

function FeedNavigator() {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen name='FeedHome' component={FeedHome} />
      <FeedStack.Screen name='FeedDetails' component={FeedDetails} />
    </FeedStack.Navigator>
  )
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name='SettingsHome' component={SettingsHome} />
      <SettingsStack.Screen name='ProfileSettings' component={ProfileSettings} />
    </SettingsStack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name='FeedTab' component={FeedNavigator} options={{ headerShown: false, title: 'Feed' }} />
        <Tab.Screen
          name='SettingsTab'
          component={SettingsNavigator}
          options={{ headerShown: false, title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})
