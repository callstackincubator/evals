import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type PermissionState = 'granted' | 'denied' | 'blocked'
type ServicesState = 'enabled' | 'disabled' | 'unknown'

export default function App() {
  const [permissionState, setPermissionState] = useState<PermissionState>('denied')
  const [servicesState, setServicesState] = useState<ServicesState>('unknown')
  const [coords, setCoords] = useState('')
  const [message, setMessage] = useState('')

  const refreshStatus = useCallback(async () => {
    const [permission, servicesEnabled] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Location.hasServicesEnabledAsync(),
    ])

    setPermissionState(permission.granted ? 'granted' : permission.canAskAgain ? 'denied' : 'blocked')
    setServicesState(servicesEnabled ? 'enabled' : 'disabled')
  }, [])

  const readLocation = useCallback(async () => {
    setCoords('')
    setMessage('')

    const servicesEnabled = await Location.hasServicesEnabledAsync()
    setServicesState(servicesEnabled ? 'enabled' : 'disabled')
    if (!servicesEnabled) {
      setMessage('Location services are disabled. Enable services to continue.')
      return
    }

    const currentPermission = await Location.getForegroundPermissionsAsync()
    const permission = currentPermission.granted
      ? currentPermission
      : await Location.requestForegroundPermissionsAsync()

    setPermissionState(permission.granted ? 'granted' : permission.canAskAgain ? 'denied' : 'blocked')
    if (!permission.granted) {
      setMessage('Location permission not granted. Retry permission request.')
      return
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setCoords(`${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`)
    } catch {
      setMessage('Location read failed. Please retry.')
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Service Gate</Text>
      <Text style={styles.state}>Permission: {permissionState}</Text>
      <Text style={styles.state}>Services: {servicesState}</Text>

      <Pressable onPress={refreshStatus} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Refresh permission + services</Text>
      </Pressable>

      <Pressable onPress={readLocation} style={styles.button}>
        <Text style={styles.buttonText}>Read location</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recovery guidance</Text>
        <Text style={styles.cardBody}>
          If services are disabled, do not attempt location fetch. Ask users to enable location services first.
        </Text>
        <Text style={styles.coords}>Coordinates: {coords || 'not available'}</Text>
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
