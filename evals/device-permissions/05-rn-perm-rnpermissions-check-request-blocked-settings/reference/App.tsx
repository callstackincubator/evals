import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  type PermissionStatus,
} from 'react-native-permissions'

const CAMERA_PERMISSION =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA

export default function App() {
  const [status, setStatus] = useState<PermissionStatus | undefined>()

  const runCheck = async () => {
    const currentStatus = await check(CAMERA_PERMISSION)
    setStatus(currentStatus)
  }

  const runRequest = async () => {
    const requestResult = await request(CAMERA_PERMISSION)
    setStatus(requestResult)
  }

  const statusMessage = (() => {
    switch (status) {
      case 'granted':
      case 'limited':
        return 'Camera feature enabled'
      case 'blocked':
        return 'Camera blocked in system settings'
      case 'unavailable':
        return 'Camera unavailable on this device'
      case 'denied':
        return 'Camera permissions denied'
      default:
        return 'Camera permissions not requested'
    }
  })()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.statusMessage}>{statusMessage}</Text>

      <Pressable onPress={runCheck} style={styles.button}>
        <Text style={styles.buttonText}>Check permission</Text>
      </Pressable>

      {status === 'blocked' ? (
        <>
          <Pressable
            onPress={() => openSettings()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Open settings</Text>
          </Pressable>
          <Text style={styles.note}>
            Permission blocked. Use Open settings to recover.
          </Text>
        </>
      ) : (
        <Pressable onPress={runRequest} style={styles.button}>
          <Text style={styles.buttonText}>Request permission</Text>
        </Pressable>
      )}

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    rowGap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    color: '#374151',
    fontWeight: '600',
  },
  statusMessage: {
    color: '#4b5563',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#9ca3af',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  note: {
    color: '#111827',
    textAlign: 'center',
  },
})
