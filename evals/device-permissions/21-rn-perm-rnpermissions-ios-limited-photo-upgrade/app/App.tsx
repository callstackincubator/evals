import { StatusBar } from 'expo-status-bar'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  
} from 'react-native-permissions'

const CAMERA_PERMISSION =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA

async function checkPermissionPlaceholder() {
  // TODO: implement check/request/blocked flow
  return check(CAMERA_PERMISSION)
}

async function requestPermissionPlaceholder() {
  // TODO: implement request sequencing for this eval
  return request(CAMERA_PERMISSION)
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>RN Permissions Starter</Text>
      <Pressable style={styles.button} onPress={() => void checkPermissionPlaceholder()}>
        <Text style={styles.buttonText}>Check placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void requestPermissionPlaceholder()}>
        <Text style={styles.buttonText}>Request placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void openSettings()}>
        <Text style={styles.buttonText}>Open settings</Text>
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
