import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'

async function checkNotificationsPlaceholder() {
  // TODO: implement notifications status flow for this eval
  return Notifications.getPermissionsAsync()
}

async function requestNotificationsPlaceholder() {
  // TODO: implement notifications request/channel ordering for this eval
  
  return Notifications.requestPermissionsAsync()
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Expo Notifications Starter</Text>
      <Pressable style={styles.button} onPress={() => void checkNotificationsPlaceholder()}>
        <Text style={styles.buttonText}>Check notifications placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void requestNotificationsPlaceholder()}>
        <Text style={styles.buttonText}>Request notifications placeholder</Text>
      </Pressable>
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
