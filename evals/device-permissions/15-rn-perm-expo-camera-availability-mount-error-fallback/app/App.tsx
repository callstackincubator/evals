import { CameraView, useCameraPermissions } from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import { Pressable, StyleSheet, Text, View } from 'react-native'

async function requestCameraAccessPlaceholder(requestPermission: () => Promise<any>) {
  // TODO: implement camera permission flow for this eval
  return requestPermission()
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Expo Camera Starter</Text>
      <Text style={styles.subtitle}>Granted: {String(Boolean(permission?.granted))}</Text>
      <Pressable
        style={styles.button}
        onPress={() => void requestCameraAccessPlaceholder(requestPermission)}
      >
        <Text style={styles.buttonText}>Call camera permission placeholder</Text>
      </Pressable>
      <CameraView style={styles.preview} facing='back' />
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
  preview: {
    borderRadius: 10,
    height: 120,
    overflow: 'hidden',
    width: '80%',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 10,
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
