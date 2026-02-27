import { CameraView, useCameraPermissions } from 'expo-camera'
import React, { useCallback, useMemo, useState } from 'react'
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
  const [permission, requestPermission, getPermission] = useCameraPermissions()
  const [requesting, setRequesting] = useState(false)

  const flowState = ((): FlowState => {
    if (requesting) return 'requesting'
    if (!permission || permission.status === 'undetermined') return 'idle'
    if (permission.granted) return 'granted'
    return permission.canAskAgain ? 'denied' : 'blocked'
  })()

  const refreshPermission = async () => {
    return getPermission()
  }

  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void refreshPermission()
    })
    return () => sub.remove()
  }, [refreshPermission])

  const requestCameraPermissionAction = async () => {
    if (requesting || flowState === 'blocked') return
    setRequesting(true)
    try {
      await requestPermission()
    } finally {
      setRequesting(false)
    }
  }

  const statusText = {
    idle: 'Camera permission not requested yet.',
    requesting: 'Requesting camera permission...',
    granted: 'Camera permission granted. Preview is enabled.',
    denied: 'Camera permission denied. You can retry the request.',
    blocked: 'Camera access is blocked. Enable it from system settings.',
  }[flowState]

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
          onPress={requestCameraPermissionAction}
          style={[
            styles.button,
            flowState === 'requesting' && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>Request / Retry</Text>
        </Pressable>

        <Pressable onPress={refreshPermission} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Refresh state</Text>
        </Pressable>

        {flowState === 'blocked' && (
          <Pressable
            onPress={() => Linking.openSettings()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Open settings</Text>
          </Pressable>
        )}
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
