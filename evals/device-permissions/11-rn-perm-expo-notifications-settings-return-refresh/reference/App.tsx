import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

type PermissionState = 'unknown' | 'loading' | 'granted' | 'denied' | 'blocked'

function mapPermissionState(permission: Notifications.NotificationPermissionsStatus): PermissionState {
  if (permission.status === Notifications.PermissionStatus.GRANTED) {
    return 'granted'
  }

  if (permission.status === Notifications.PermissionStatus.DENIED) {
    return permission.canAskAgain ? 'denied' : 'blocked'
  }

  return 'denied'
}

export default function App() {
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown')
  const [message, setMessage] = useState('')
  const awaitingSettingsReturn = useRef(false)

  const refreshPermissions = useCallback(async () => {
    setPermissionState('loading')
    const permission = await Notifications.getPermissionsAsync()
    setPermissionState(mapPermissionState(permission))
  }, [])

  const requestPermissions = useCallback(async () => {
    setPermissionState('loading')
    const permission = await Notifications.requestPermissionsAsync()
    setPermissionState(mapPermissionState(permission))
  }, [])

  useEffect(() => {
    refreshPermissions()

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && awaitingSettingsReturn.current) {
        awaitingSettingsReturn.current = false
        refreshPermissions()
      }
    })

    return () => subscription.remove()
  }, [refreshPermissions])

  const openSettings = useCallback(() => {
    awaitingSettingsReturn.current = true
    Linking.openSettings()
  }, [])

  const canUseNotificationFeature = permissionState === 'granted'
  const featureLabel = useMemo(() => {
    if (permissionState === 'loading' || permissionState === 'unknown') {
      return 'Waiting for fresh permission state...'
    }

    if (permissionState === 'granted') {
      return 'Notification-only action enabled.'
    }

    return 'Notification-only action disabled until refreshed grant state.'
  }, [permissionState])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings Recovery</Text>
      <Text style={styles.state}>Permission: {permissionState}</Text>

      <Pressable onPress={requestPermissions} style={styles.button}>
        <Text style={styles.buttonText}>Request notifications</Text>
      </Pressable>

      <Pressable onPress={refreshPermissions} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Refresh permissions</Text>
      </Pressable>

      {(permissionState === 'denied' || permissionState === 'blocked') && (
        <Pressable onPress={openSettings} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open settings</Text>
        </Pressable>
      )}

      <Pressable
        disabled={!canUseNotificationFeature || permissionState === 'loading'}
        onPress={() => setMessage('Notification-only action executed.')}
        style={[
          styles.button,
          (!canUseNotificationFeature || permissionState === 'loading') && styles.disabledButton,
        ]}
      >
        <Text style={styles.buttonText}>Notification-only action</Text>
      </Pressable>

      <Text style={styles.featureLabel}>{featureLabel}</Text>
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
  disabledButton: {
    opacity: 0.5,
  },
  featureLabel: {
    color: '#4b5563',
    textAlign: 'center',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
