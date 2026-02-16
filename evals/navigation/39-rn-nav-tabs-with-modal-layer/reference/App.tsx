import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const RootStack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function FeedScreen() {
  const navigation = useNavigation()

  const handleCompose = () => {
    navigation.getParent()?.navigate('ComposeModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Compose" onPress={handleCompose} />
    </View>
  )
}

function ProfileScreen() {
  const navigation = useNavigation()

  const handleCompose = () => {
    navigation.getParent()?.navigate('ComposeModal')
  }

  return (
    <View style={styles.centered}>
      <Button title="Compose" onPress={handleCompose} />
    </View>
  )
}

function ComposeModal() {
  const navigation = useNavigation()

  const handleDismiss = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.modal}>
      <Text>Compose modal</Text>
      <Button title="Dismiss" onPress={handleDismiss} />
    </View>
  )
}

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="MainTabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="ComposeModal"
          component={ComposeModal}
          options={{ presentation: 'modal', title: 'Compose' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
