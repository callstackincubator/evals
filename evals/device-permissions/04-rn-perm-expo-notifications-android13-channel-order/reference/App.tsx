import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { NotificationPermissionsStatus } from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type RegistrationState = 'idle' | 'denied' | 'blocked' | 'ready' | 'token-error'

export default function App() {
  const [registrationState, setRegistrationState] =
    useState<RegistrationState>('idle')
  const [token, setToken] = useState<string>('')
  const [message, setMessage] = useState('')

  const requestNotificationPermissions =
    async (): Promise<NotificationPermissionsStatus> => {
      const currentStatus = await Notifications.getPermissionsAsync()
      const finalStatus =
        currentStatus.status !== Notifications.PermissionStatus.GRANTED
          ? await Notifications.requestPermissionsAsync()
          : currentStatus

      return finalStatus
    }

  const getPushToken = async () => {
    try {
      const pushToken = await Notifications.getExpoPushTokenAsync()
      setToken(pushToken.data)
      setRegistrationState('ready')
    } catch {
      setRegistrationState('token-error')
      setMessage(
        'Permission is granted, but token retrieval failed. Retry registration.'
      )
    }
  }

  const register = async () => {
    setMessage('')
    setToken('')

    if (!Device.isDevice) {
      setMessage(
        'This is not a physical device. Push notification not supported on emulators/simulators.'
      )
      return
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        importance: Notifications.AndroidImportance.MAX,
        lightColor: '#4f46e5',
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        name: 'default',
      })
    }

    const permissionsResult = await requestNotificationPermissions()
    if (permissionsResult.status === Notifications.PermissionStatus.DENIED) {
      setRegistrationState(permissionsResult.canAskAgain ? 'denied' : 'blocked')

      setMessage(
        'Notifications permission denied. Token registration is intentionally skipped.'
      )
      return
    }

    await getPushToken()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.state}>State: {registrationState}</Text>

      <Pressable onPress={register} style={styles.button}>
        <Text style={styles.buttonText}>Configure + Register</Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openSettings()}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>

      {token ? (
        <Text style={styles.token}>Expo token: {token}</Text>
      ) : (
        <Text style={styles.fallback}>
          No token yet. Denied path keeps registration disabled.
        </Text>
      )}

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.deviceInfo}>
        Device: {Device.isDevice ? 'Physical' : 'Simulator/Emulator'}
      </Text>
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
  },
  state: {
    color: '#374151',
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
  token: {
    color: '#065f46',
    fontSize: 12,
  },
  fallback: {
    color: '#6b7280',
    textAlign: 'center',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
  deviceInfo: {
    color: '#4b5563',
    fontSize: 12,
  },
})
