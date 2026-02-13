import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type NotificationState = 'not-determined' | 'denied' | 'provisional' | 'granted'

function mapPermissionState(permission: Notifications.NotificationPermissionsStatus): NotificationState {
  const iosStatus = permission.ios?.status

  if (iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return 'provisional'
  }

  if (permission.status === Notifications.PermissionStatus.GRANTED) {
    return 'granted'
  }

  if (permission.status === Notifications.PermissionStatus.DENIED) {
    return 'denied'
  }

  return 'not-determined'
}

export default function App() {
  const [state, setState] = useState<NotificationState>('not-determined')
  const [message, setMessage] = useState('Request permissions to determine iOS auth level.')

  const refreshStatus = useCallback(async () => {
    const permission = await Notifications.getPermissionsAsync()
    setState(mapPermissionState(permission))
  }, [])

  const requestPermission = useCallback(async () => {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowProvisional: true,
        allowSound: true,
      },
    })

    const nextState = mapPermissionState(requested)
    setState(nextState)

    if (nextState === 'provisional') {
      setMessage('Provisional notifications are usable with degraded delivery behavior.')
      return
    }

    if (nextState === 'granted') {
      setMessage('Full notification authorization granted.')
      return
    }

    if (nextState === 'denied') {
      setMessage('Notifications denied. User must recover from settings.')
      return
    }

    setMessage('Permission still not determined. User can request again.')
  }, [])

  const statusText = useMemo(() => {
    switch (state) {
      case 'granted':
        return 'Full authorization'
      case 'provisional':
        return 'Provisional authorization (degraded but usable)'
      case 'denied':
        return 'Denied'
      default:
        return 'Not determined'
    }
  }, [state])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Notification Permission Gate</Text>
      <Text style={styles.status}>{statusText}</Text>

      <Pressable onPress={requestPermission} style={styles.button}>
        <Text style={styles.buttonText}>Request permission</Text>
      </Pressable>

      <Pressable onPress={refreshStatus} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Refresh status</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Feature mode</Text>
        <Text style={styles.cardBody}>
          {state === 'granted'
            ? 'All notification features enabled.'
            : state === 'provisional'
              ? 'Only provisional-safe notification UX is enabled.'
              : 'Notification-dependent actions are disabled.'}
        </Text>
      </View>

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
    textAlign: 'center',
  },
  status: {
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBody: {
    color: '#4b5563',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
