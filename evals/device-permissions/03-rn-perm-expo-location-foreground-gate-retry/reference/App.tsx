import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type LocationState = 'idle' | 'granted' | 'denied' | 'blocked' | 'error'

export default function App() {
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [isReadingLocation, setReadingLocation] = useState(false)
  const [coords, setCoords] = useState<string>('')
  const [message, setMessage] = useState('')

  const requestForeground = async () => {
    setMessage('')
    const response = await Location.requestForegroundPermissionsAsync()

    if (response.granted) {
      setLocationState('granted')
      return true
    }

    setLocationState(response.canAskAgain ? 'denied' : 'blocked')
    return false
  }

  const requestAndReadLocation = async () => {
    if (isReadingLocation) {
      return
    }
    setReadingLocation(true)
    setCoords('')
    setMessage('')

    try {
      const granted = await requestForeground()
      if (!granted) {
        setMessage(
          'Location permission unavailable. Retry or continue without location.'
        )
        return
      }

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        setCoords(
          `${current.coords.latitude.toFixed(5)}, ${current.coords.longitude.toFixed(5)}`
        )
      } catch {
        setLocationState('error')
        setMessage('Location read failed. You can retry or use degraded mode.')
      }
    } finally {
      setReadingLocation(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foreground Location Flow</Text>
      <Text style={styles.state}>State: {locationState}</Text>

      <Pressable
        disabled={isReadingLocation}
        onPress={requestAndReadLocation}
        style={[
          styles.button,
          {
            backgroundColor: isReadingLocation ? '#1118274D' : '#111827',
          },
        ]}
      >
        <Text style={styles.buttonText}>Request + Read location</Text>
      </Pressable>

      {coords ? (
        <Text style={styles.coords}>Coordinates: {coords}</Text>
      ) : (
        <View style={styles.fallbackCard}>
          <Text style={styles.fallbackTitle}>Degraded mode</Text>
          <Text style={styles.fallbackBody}>
            Location-dependent features stay disabled until permission and fetch
            succeed.
          </Text>
        </View>
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
  coords: {
    color: '#065f46',
    fontWeight: '600',
  },
  fallbackCard: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  fallbackTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  fallbackBody: {
    color: '#4b5563',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
