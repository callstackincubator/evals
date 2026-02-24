import * as Location from 'expo-location'
import React, { useRef, useState } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

type Step =
  | 'idle'
  | 'foreground-denied'
  | 'foreground-granted'
  | 'background-granted'
  | 'background-denied-needs-settings'

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('idle')
  const [message, setMessage] = useState('')
  const [foregroundCoords, setForegroundCoords] = useState('')

  const hasAttemptedBackgroundThisSessionRef = useRef(false)

  const requestForegroundPermissions = async (): Promise<boolean> => {
    setMessage('')
    const permission = await Location.requestForegroundPermissionsAsync()

    if (!permission.granted) {
      setCurrentStep('foreground-denied')
      setMessage('Foreground permission denied. Retry permission request.')
      return false
    }

    setCurrentStep((prev) =>
      prev === 'background-granted'
        ? 'background-granted'
        : 'foreground-granted'
    )
    return true
  }

  const fetchForegroundLocation = async () => {
    const hasForeground = await requestForegroundPermissions()
    if (!hasForeground) return

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    setForegroundCoords(
      `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
    )
  }

  const requestBackgroundPermissions = async () => {
    setMessage('')
    const hasForeground = await requestForegroundPermissions()
    if (!hasForeground) return

    if (hasAttemptedBackgroundThisSessionRef.current) {
      setCurrentStep('background-denied-needs-settings')
      setMessage(
        'Background upgrade was already attempted this session. Use settings recovery.'
      )
      return
    }

    hasAttemptedBackgroundThisSessionRef.current = true
    const background = await Location.requestBackgroundPermissionsAsync()

    if (background.granted) {
      setCurrentStep('background-granted')
      setMessage('Background location granted.')
      return
    }

    setCurrentStep('background-denied-needs-settings')
    setMessage('Background not granted in-session. Open settings to upgrade.')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Location Upgrade Flow</Text>
      <Text style={styles.state}>Step: {currentStep}</Text>
      <Text style={styles.message}>{message}</Text>

      <Pressable onPress={fetchForegroundLocation} style={styles.button}>
        <Text style={styles.buttonText}>Use foreground location</Text>
      </Pressable>

      <Pressable onPress={requestBackgroundPermissions} style={styles.button}>
        <Text style={styles.buttonText}>Upgrade to background</Text>
      </Pressable>

      <Pressable
        disabled={currentStep !== 'background-denied-needs-settings'}
        onPress={Linking.openSettings}
        style={[
          styles.secondaryButton,
          currentStep !== 'background-denied-needs-settings' &&
          styles.disabledButton,
        ]}
      >
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Foreground mode remains usable</Text>
        <Text style={styles.cardBody}>
          Foreground reads keep working even when background permission is
          unavailable.
        </Text>
        <Text style={styles.coords}>
          Last foreground coords: {foregroundCoords || 'not loaded'}
        </Text>
      </View>
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
