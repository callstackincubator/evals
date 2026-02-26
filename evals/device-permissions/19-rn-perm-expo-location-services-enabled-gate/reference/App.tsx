import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type PermissionState = 'granted' | 'denied' | 'blocked' | 'unknown'
type ServicesState = 'enabled' | 'disabled' | 'unknown'

function toPermissionState(p: Location.PermissionResponse): PermissionState {
  if (p.status === Location.PermissionStatus.UNDETERMINED) return 'unknown'
  return p.granted ? 'granted' : p.canAskAgain ? 'denied' : 'blocked'
}

export default function App() {
  const [permissionState, setPermissionState] =
    useState<PermissionState>('unknown')
  const [servicesState, setServicesState] = useState<ServicesState>('unknown')
  const [coords, setCoords] = useState('')
  const [message, setMessage] = useState('')

  const checkServiceEnabledAsync = async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync()
    const serviceStateValue = servicesEnabled ? 'enabled' : 'disabled'
    setServicesState(serviceStateValue)
    return serviceStateValue
  }

  const checkLocationPermission = async () => {
    const permission = await Location.getForegroundPermissionsAsync()
    const permissionStateValue = toPermissionState(permission)
    setPermissionState(permissionStateValue)
    return permissionStateValue
  }

  const refreshStatus = async () =>
    await Promise.all([checkLocationPermission(), checkServiceEnabledAsync()])

  const readLocation = async () => {
    setCoords('')
    setMessage('')

    const [currentPermissionState, currentServiceState] = await refreshStatus()

    if (currentServiceState === 'disabled') {
      setMessage('Location services are disabled. Enable services to continue.')
      return
    }

    if (currentPermissionState !== 'granted') {
      const permission = await Location.requestForegroundPermissionsAsync()
      setPermissionState(toPermissionState(permission))
      if (!permission.granted) {
        setMessage('Location permission not granted. Retry permission request.')
        return
      }
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setCoords(
        `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`
      )
    } catch {
      setMessage('Location read failed. Please retry.')
    }
  }

  const openSettings = () => {
    if (Platform.OS === 'android' && 'sendIntent' in Linking) {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
    } else {
      Linking.openSettings()
    }
  }

  useEffect(() => {
    refreshStatus()

    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') refreshStatus()
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const readDisabled =
    servicesState === 'disabled' || permissionState === 'blocked'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Service Gate</Text>
      <Text style={styles.state}>Permission: {permissionState}</Text>
      <Text style={styles.state}>Services: {servicesState}</Text>

      <Pressable onPress={refreshStatus} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          Refresh permission + services
        </Text>
      </Pressable>

      <Pressable
        disabled={readDisabled}
        onPress={readLocation}
        style={[styles.button, readDisabled && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>Read location</Text>
      </Pressable>

      {servicesState === 'disabled' && (
        <Pressable onPress={openSettings} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open Location Settings</Text>
        </Pressable>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recovery guidance</Text>
        <Text style={styles.cardBody}>
          If services are disabled, do not attempt location fetch. Ask users to
          enable location services first.
        </Text>
        <Text style={styles.coords}>
          Coordinates: {coords || 'not available'}
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    rowGap: 6,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '600',
  },
  cardBody: {
    color: '#4b5563',
  },
  coords: {
    color: '#1f2937',
    fontSize: 12,
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
