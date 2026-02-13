import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type RegistrationState = 'idle' | 'denied' | 'simulator' | 'registered'

export default function App() {
  const [registrationState, setRegistrationState] = useState<RegistrationState>('idle')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')

  const register = useCallback(async () => {
    setToken('')
    setMessage('')

    const current = await Notifications.getPermissionsAsync()
    const permission =
      current.status === Notifications.PermissionStatus.GRANTED
        ? current
        : await Notifications.requestPermissionsAsync()

    if (permission.status !== Notifications.PermissionStatus.GRANTED) {
      setRegistrationState('denied')
      setMessage('Notifications permission denied. Token request skipped.')
      return
    }

    if (!Device.isDevice) {
      setRegistrationState('simulator')
      setMessage('Push token retrieval is only supported on physical devices.')
      return
    }

    const pushToken = await Notifications.getExpoPushTokenAsync()
    setToken(pushToken.data)
    setRegistrationState('registered')
    setMessage('Registration succeeded on physical device with granted permission.')
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Physical Device Push Gate</Text>
      <Text style={styles.state}>State: {registrationState}</Text>
      <Text style={styles.device}>Environment: {Device.isDevice ? 'Physical' : 'Simulator/Emulator'}</Text>

      <Pressable onPress={register} style={styles.button}>
        <Text style={styles.buttonText}>Register push token</Text>
      </Pressable>

      {token ? <Text style={styles.token}>Token: {token}</Text> : <Text style={styles.fallback}>No token</Text>}

      <Text style={styles.message}>{message}</Text>
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
  device: {
    color: '#4b5563',
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
  token: {
    color: '#065f46',
    fontSize: 12,
  },
  fallback: {
    color: '#6b7280',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
