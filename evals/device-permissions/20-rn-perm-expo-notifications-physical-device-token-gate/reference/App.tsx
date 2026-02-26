import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type RegistrationState =
  | 'idle'
  | 'denied'
  | 'simulator'
  | 'registered'
  | 'token-error'

class TokenError extends Error {
  public code: string

  constructor(message: string, code = 'TOKEN_ERROR') {
    super(message)
    this.name = 'TokenError'
    this.code = code
  }
}

export default function App() {
  const [registrationState, setRegistrationState] =
    useState<RegistrationState>('idle')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const requestPermissions = async () => {
    const current = await Notifications.getPermissionsAsync()
    const permission =
      current.status === Notifications.PermissionStatus.GRANTED
        ? current
        : await Notifications.requestPermissionsAsync()

    const granted = permission.status === Notifications.PermissionStatus.GRANTED
    if (!granted) {
      setRegistrationState('denied')
      setMessage('Notifications permission denied. Token request skipped.')
    }

    return granted
  }

  const requestPushToken = async () => {
    if (!Device.isDevice) {
      setRegistrationState('simulator')
      setMessage('Push token retrieval is only supported on physical devices.')
      return
    }

    try {
      const pushToken = await Notifications.getExpoPushTokenAsync()
      const tokenValue = pushToken?.data?.trim()
      if (!tokenValue) {
        throw new TokenError(
          'Token retrieval returned an empty token. Retry registration.'
        )
      }

      setToken(tokenValue)
      setRegistrationState('registered')
      setMessage(
        'Registration succeeded on physical device with granted permission.'
      )
    } catch (error) {
      setRegistrationState('token-error')
      if (error instanceof TokenError) {
        setMessage(error.message)
      } else {
        setMessage(
          'Permission/device checks passed, but token retrieval failed. Retry registration.'
        )
      }
    }
  }

  const register = async () => {
    if (isRegistering) {
      return
    }

    setIsRegistering(true)
    try {
      setToken('')
      setMessage('')

      const granted = await requestPermissions()
      if (!granted) {
        return
      }

      await requestPushToken()
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Physical Device Push Gate</Text>
      <Text style={styles.state}>State: {registrationState}</Text>
      <Text style={styles.device}>
        Environment: {Device.isDevice ? 'Physical' : 'Simulator/Emulator'}
      </Text>

      <Pressable
        disabled={isRegistering}
        onPress={register}
        style={[styles.button, isRegistering && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {isRegistering ? 'Registering...' : 'Register push token'}
        </Text>
      </Pressable>

      {token ? (
        <Text style={styles.token}>Token: {token}</Text>
      ) : (
        <Text style={styles.fallback}>No token</Text>
      )}

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
  buttonDisabled: {
    opacity: 0.6,
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
