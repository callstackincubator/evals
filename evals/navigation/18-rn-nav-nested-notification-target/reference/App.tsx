import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, View } from 'react-native'

const Tab = createBottomTabNavigator()
const NotificationsStack = createNativeStackNavigator()

function FeedScreen({ navigation }: { navigation: any }) {
  const openNotification = () => {
    navigation.navigate('NotificationsTab', {
      screen: 'NotificationDetails',
      params: { notificationId: 'n-900' },
    })
  }

  return (
    <View style={styles.container}>
      <Button title='Open notification n-900' onPress={openNotification} />
    </View>
  )
}

function NotificationsListScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button
        title='Open n-101'
        onPress={() => navigation.navigate('NotificationDetails', { notificationId: 'n-101' })}
      />
    </View>
  )
}

function NotificationDetailsScreen({ route }: { route: any }) {
  return (
    <View style={styles.container}>
      <Text>Notification: {route.params?.notificationId}</Text>
    </View>
  )
}

function NotificationsNavigator() {
  return (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen name='NotificationsList' component={NotificationsListScreen} />
      <NotificationsStack.Screen name='NotificationDetails' component={NotificationDetailsScreen} />
    </NotificationsStack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name='Feed' component={FeedScreen} />
        <Tab.Screen name='NotificationsTab' component={NotificationsNavigator} options={{ title: 'Notifications' }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})
