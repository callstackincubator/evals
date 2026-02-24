/**
 * Renamed types, methods, and variables for clarity (e.g. flow → currentStep, BackgroundFlow → Step, startBackgroundSetup → requestForegroundPermissions).
 * Added Android 11+ version check (Platform.OS === 'android' && Platform.Version >= 30) to show appropriate rationale.
 * Updated rationale message to meet requirements: explain why background is needed and that tapping continue takes user to Settings with "Allow all the time" on Android 11+.
 * Removed StatusBar (unrelated to prompt/requirements).
 * Open Settings Pressable uses Linking.openSettings directly instead of () => Linking.openSettings() to avoid unnecessary anonymous function.
 * Removed useCallback memoization.
 */

import * as Location from 'expo-location'
import React, { useState } from 'react'
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type Step =
  | 'idle'
  | 'foreground-denied'
  | 'rationale'
  | 'background-granted'
  | 'foreground-only'

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('idle')
  const [message, setMessage] = useState('')

  const requestForegroundPermissions = async () => {
    setMessage('')

    const foreground = await Location.requestForegroundPermissionsAsync()

    if (foreground.granted) {
      setCurrentStep('rationale')

      const isAndroid11Plus =
        Platform.OS === 'android' && (Platform.Version as number) >= 30

      if (isAndroid11Plus) {
        setMessage(
          'Background location is needed for X and Y. Tapping continue will take you to Settings — select "Allow all the time" under Location.'
        )
      } else {
        setMessage(
          'Background location is needed for X and Y. A system dialog will appear asking for background access.'
        )
      }
    } else {
      setCurrentStep('foreground-denied')
      setMessage(
        'Foreground location is required before background onboarding.'
      )
    }
  }

  const requestBackgroundPermissions = async () => {
    const background = await Location.requestBackgroundPermissionsAsync()

    if (background.granted) {
      setCurrentStep('background-granted')
      setMessage('Background location granted.')
    } else {
      setCurrentStep('foreground-only')
      setMessage('Background denied. Foreground-only mode remains functional.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Location Onboarding</Text>
      <Text style={styles.state}>Step: {currentStep}</Text>
      <Text style={styles.message}>{message}</Text>

      <Pressable onPress={requestForegroundPermissions} style={styles.button}>
        <Text style={styles.buttonText}>Request foreground first</Text>
      </Pressable>

      <Pressable
        disabled={currentStep !== 'rationale'}
        onPress={requestBackgroundPermissions}
        style={[
          styles.button,
          currentStep !== 'rationale' && styles.disabledButton,
        ]}
      >
        <Text style={styles.buttonText}>Request background</Text>
      </Pressable>

      <Pressable onPress={Linking.openSettings} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>
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
