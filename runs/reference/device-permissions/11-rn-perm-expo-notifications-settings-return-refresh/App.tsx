import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

type PermissionState =
  | 'unknown'
  | 'loading'
  | 'not-determined'
  | 'granted'
  | 'denied'
  | 'blocked'

function mapPermissionState(permission: Notifications.NotificationPermissionsStatus): PermissionState {
  switch (permission.status) {
    case Notifications.PermissionStatus.GRANTED:
      return 'granted'
    case Notifications.PermissionStatus.DENIED:
      return permission.canAskAgain ? 'denied' : 'blocked'
    case Notifications.PermissionStatus.UNDETERMINED:
      return 'not-determined'
    default:
      return 'unknown'
  }
}

export default function App() {
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown')
  const [message, setMessage] = useState('')
  const [hasHydrated, setHasHydrated] = useState(false)
  const isRefreshingPermissions = useRef(false)

  const refreshPermissions = useCallback(async () => {
    if (isRefreshingPermissions.current) return
    isRefreshingPermissions.current = true
    setPermissionState('loading')
    try {
      const permission = await Notifications.getPermissionsAsync()
      setPermissionState(mapPermissionState(permission))
    } finally {
      setHasHydrated(true)
      isRefreshingPermissions.current = false
    }
  }, [])

  const requestPermissions = async () => {
    setPermissionState('loading')
    try {
      const permission = await Notifications.requestPermissionsAsync()
      setPermissionState(mapPermissionState(permission))
    } finally {
      setHasHydrated(true)
    }
  }

  useEffect(() => {
    refreshPermissions()

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshPermissions()
      }
    })

    return () => subscription.remove()
  }, [refreshPermissions])

  const canUseNotificationFeature = permissionState === 'granted' && hasHydrated
  const getFeatureLabel = () => {
    if (permissionState === 'loading' || !hasHydrated) {
      return 'Waiting for fresh permission state...'
    }

    if (permissionState === 'granted') {
      return 'Notification-only action enabled.'
    }

    return 'Notification-only action disabled until refreshed grant state.'
  }

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
        <Pressable onPress={() => Linking.openSettings()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open settings</Text>
        </Pressable>
      )}

      <Pressable
        disabled={!canUseNotificationFeature}
        onPress={() => setMessage('Notification-only action executed.')}
        style={[
          styles.button,
          (!canUseNotificationFeature) && styles.disabledButton,
        ]}
      >
        <Text style={styles.buttonText}>Notification-only action</Text>
      </Pressable>

      <Text style={styles.featureLabel}>{getFeatureLabel()}</Text>
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
