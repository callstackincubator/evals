import * as Location from 'expo-location'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useState } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

type FlowState =
  | 'idle'
  | 'foreground-denied'
  | 'foreground-granted'
  | 'background-granted'
  | 'background-denied-needs-settings'

export default function App() {
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [message, setMessage] = useState('')
  const [foregroundCoords, setForegroundCoords] = useState('')
  const [attemptedBackgroundUpgrade, setAttemptedBackgroundUpgrade] = useState(false)

  const enableForeground = useCallback(async () => {
    setMessage('')
    const permission = await Location.requestForegroundPermissionsAsync()

    if (!permission.granted) {
      setFlowState('foreground-denied')
      setMessage('Foreground permission denied. Retry permission request.')
      return false
    }

    setFlowState((previous) =>
      previous === 'background-granted' ? 'background-granted' : 'foreground-granted'
    )
    return true
  }, [])

  const readForegroundLocation = useCallback(async () => {
    const hasForeground = await enableForeground()
    if (!hasForeground) {
      return
    }

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    setForegroundCoords(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`)
  }, [enableForeground])

  const upgradeToBackground = useCallback(async () => {
    setMessage('')
    const hasForeground = await enableForeground()
    if (!hasForeground) {
      return
    }

    if (attemptedBackgroundUpgrade) {
      setFlowState('background-denied-needs-settings')
      setMessage('Background upgrade was already attempted this session. Use settings recovery.')
      return
    }

    setAttemptedBackgroundUpgrade(true)
    const background = await Location.requestBackgroundPermissionsAsync()

    if (background.granted) {
      setFlowState('background-granted')
      setMessage('Background location granted.')
      return
    }

    setFlowState('background-denied-needs-settings')
    setMessage(
      'Background not granted in-session (Allow Once / When In Use path). Open settings to upgrade.'
    )
  }, [attemptedBackgroundUpgrade, enableForeground])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Location Upgrade Flow</Text>
      <Text style={styles.state}>State: {flowState}</Text>

      <Pressable onPress={readForegroundLocation} style={styles.button}>
        <Text style={styles.buttonText}>Use foreground location</Text>
      </Pressable>

      <Pressable onPress={upgradeToBackground} style={styles.button}>
        <Text style={styles.buttonText}>Upgrade to background</Text>
      </Pressable>

      <Pressable
        disabled={flowState !== 'background-denied-needs-settings'}
        onPress={() => Linking.openSettings()}
        style={[
          styles.secondaryButton,
          flowState !== 'background-denied-needs-settings' && styles.disabledButton,
        ]}
      >
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Foreground mode remains usable</Text>
        <Text style={styles.cardBody}>
          Foreground reads keep working even when background permission is unavailable.
        </Text>
        <Text style={styles.coords}>Last foreground coords: {foregroundCoords || 'not loaded'}</Text>
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
