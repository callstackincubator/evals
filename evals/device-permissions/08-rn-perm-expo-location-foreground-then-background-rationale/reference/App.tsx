import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useState } from 'react'
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

type BackgroundFlow = 'idle' | 'foreground-denied' | 'rationale' | 'background-granted' | 'foreground-only'

export default function App() {
  const [flow, setFlow] = useState<BackgroundFlow>('idle')
  const [message, setMessage] = useState('')

  const startBackgroundSetup = useCallback(async () => {
    setMessage('')

    const foreground = await Location.requestForegroundPermissionsAsync()
    if (!foreground.granted) {
      setFlow('foreground-denied')
      setMessage('Foreground location is required before background onboarding.')
      return
    }

    setFlow('rationale')
    setMessage('Foreground granted. Explain why background location is needed before continuing.')
  }, [])

  const continueToBackgroundRequest = useCallback(async () => {
    const background = await Location.requestBackgroundPermissionsAsync()

    if (background.granted) {
      setFlow('background-granted')
      setMessage('Background location granted.')
      return
    }

    setFlow('foreground-only')

    if (Platform.OS === 'android') {
      setMessage('Background denied. Android may require settings redirection on Android 11+.')
      return
    }

    setMessage('Background denied. Foreground-only mode remains functional.')
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Location Onboarding</Text>
      <Text style={styles.state}>Flow: {flow}</Text>

      <Pressable onPress={startBackgroundSetup} style={styles.button}>
        <Text style={styles.buttonText}>Request foreground first</Text>
      </Pressable>

      <Pressable
        disabled={flow !== 'rationale'}
        onPress={continueToBackgroundRequest}
        style={[styles.button, flow !== 'rationale' && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>Continue to background request</Text>
      </Pressable>

      <Pressable onPress={() => Linking.openSettings()} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Foreground-only fallback</Text>
        <Text style={styles.cardBody}>
          Location features that require only foreground access stay available when background is denied.
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
