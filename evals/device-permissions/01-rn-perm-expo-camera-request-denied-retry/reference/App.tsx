import { CameraView, useCameraPermissions } from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type FlowState = 'idle' | 'granted' | 'denied' | 'blocked' | 'requesting'

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [flowState, setFlowState] = useState<FlowState>('idle')

  const refreshFromPermission = () => {
    if (!permission || permission.status === 'undetermined') {
      setFlowState('idle')
      return
    }

    if (permission.granted) {
      setFlowState('granted')
      return
    }

    setFlowState(permission.canAskAgain ? 'denied' : 'blocked')
  }

  const requestCamera = async () => {
    if (permission?.granted) {
      setFlowState('granted')
      return
    }

    if (flowState === 'requesting') {
      return
    }

    if (permission && !permission.granted && !permission.canAskAgain) {
      setFlowState('blocked')
      return
    }

    setFlowState('requesting')
    const next = await requestPermission()

    if (next.granted) {
      setFlowState('granted')
      return
    }

    setFlowState(next.canAskAgain ? 'denied' : 'blocked')
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState !== 'active') {
        return
      }

      if (!permission || permission.status === 'undetermined') {
        setFlowState('idle')
        return
      }

      if (permission.granted) {
        setFlowState('granted')
        return
      }

      setFlowState(permission.canAskAgain ? 'denied' : 'blocked')
    })

    return () => {
      subscription.remove()
    }
  }, [permission])

  let statusText = 'Camera permission not requested yet.'
  switch (flowState) {
    case 'granted':
      statusText = 'Camera permission granted. Preview is enabled.'
      break
    case 'denied':
      statusText = 'Camera permission denied. You can retry the request.'
      break
    case 'blocked':
      statusText = 'Camera access is blocked. Enable it from system settings.'
      break
    case 'requesting':
      statusText = 'Requesting camera permission...'
      break
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Access</Text>
      <Text style={styles.status}>{statusText}</Text>

      {flowState === 'granted' ? (
        <View style={styles.previewWrap}>
          <CameraView facing="back" style={styles.preview} />
        </View>
      ) : (
        <View style={styles.degradedCard}>
          <Text style={styles.degradedTitle}>Preview unavailable</Text>
          <Text style={styles.degradedBody}>
            Use retry or open settings to recover access.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          disabled={flowState === 'requesting'}
          onPress={requestCamera}
          style={[
            styles.button,
            flowState === 'requesting' && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>Request / Retry</Text>
        </Pressable>

        <Pressable
          onPress={refreshFromPermission}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Refresh state</Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openSettings()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Open settings</Text>
        </Pressable>
      </View>

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
  status: {
    color: '#374151',
    textAlign: 'center',
  },
  previewWrap: {
    borderRadius: 12,
    height: 220,
    overflow: 'hidden',
    width: '100%',
  },
  preview: {
    flex: 1,
  },
  degradedCard: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },
  degradedTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  degradedBody: {
    color: '#4b5563',
    marginTop: 6,
    textAlign: 'center',
  },
  actions: {
    rowGap: 10,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
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
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
})
