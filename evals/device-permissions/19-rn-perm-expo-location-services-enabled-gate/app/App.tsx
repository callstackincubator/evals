import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'

async function requestForegroundLocationPlaceholder() {
  // TODO: implement foreground permission flow for this eval
  return Location.requestForegroundPermissionsAsync()
}

async function requestBackgroundLocationPlaceholder() {
  // TODO: implement background/location services handling for this eval
  return Location.requestBackgroundPermissionsAsync()
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Expo Location Starter</Text>
      <Pressable style={styles.button} onPress={() => void requestForegroundLocationPlaceholder()}>
        <Text style={styles.buttonText}>Call foreground placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void requestBackgroundLocationPlaceholder()}>
        <Text style={styles.buttonText}>Call background placeholder</Text>
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
