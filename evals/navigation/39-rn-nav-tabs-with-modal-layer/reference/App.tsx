import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, Text, View } from 'react-native'

const RootStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function FeedScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Compose' onPress={() => navigation.getParent()?.navigate('ComposeModal')} />
    </View>
  )
}

function ProfileScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Compose' onPress={() => navigation.getParent()?.navigate('ComposeModal')} />
    </View>
  )
}

function ComposeModal({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Text>Compose modal</Text>
      <Button title='Dismiss' onPress={() => navigation.goBack()} />
    </View>
  )
}

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Feed' component={FeedScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen name='MainTabs' component={Tabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name='ComposeModal'
          component={ComposeModal}
          options={{ presentation: 'modal', title: 'Compose' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
