import { CameraView, useCameraPermissions } from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

type FlowState = 'idle' | 'granted' | 'denied' | 'blocked' | 'requesting'

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const flowStateRef = useRef<FlowState>(flowState)

  const refreshFromPermission = useCallback(() => {
    if (!permission || permission.status === 'undetermined') {
      setFlowState('idle')
      return
    }

    if (permission.granted) {
      setFlowState('granted')
      return
    }

    setFlowState(permission.canAskAgain ? 'denied' : 'blocked')
  }, [permission])

  const requestCamera = useCallback(async () => {
    if(permission?.granted) {
      setFlowState('granted')
      return
    }

    if (flowStateRef.current === 'requesting') return

    if(permission && !permission.granted && !permission.canAskAgain) {
      setFlowState("blocked")
      return
    }

    flowStateRef.current = 'requesting'
    setFlowState('requesting')
    const next = await requestPermission()

    if (next.granted) {
      setFlowState('granted')
      return
    }

    setFlowState(next.canAskAgain ? 'denied' : 'blocked')
  }, [requestPermission])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (appState) => {
      if(appState === 'active') refreshFromPermission()
    })

    return () => {
      subscription.remove()
    }
  }, [refreshFromPermission])

  const statusText = useMemo(() => {
    switch (flowState) {
      case 'granted':
        return 'Camera permission granted. Preview is enabled.'
      case 'denied':
        return 'Camera permission denied. You can retry the request.'
      case 'blocked':
        return 'Camera access is blocked. Enable it from system settings.'
      case 'requesting':
        return 'Requesting camera permission...'
      default:
        return 'Camera permission not requested yet.'
    }
  }, [flowState])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Permission Flow</Text>
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
        <Pressable onPress={requestCamera} style={styles.button}>
          <Text style={styles.buttonText}>Request / Retry</Text>
        </Pressable>

        <Pressable onPress={refreshFromPermission} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Refresh state</Text>
        </Pressable>

        <Pressable onPress={() => Linking.openSettings()} style={styles.secondaryButton}>
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
})
