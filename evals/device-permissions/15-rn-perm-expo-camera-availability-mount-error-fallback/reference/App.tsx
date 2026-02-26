import {
  Camera,
  CameraView,
  PermissionResponse,
  type CameraMountError,
} from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'
import {
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type CameraState =
  | 'checking'
  | 'permission-denied'
  | 'available'
  | 'unavailable'
  | 'mount-error'
type WebCameraType = typeof Camera & {
  isAvailableAsync(): Promise<boolean>
}

export default function App() {
  const [cameraState, setCameraState] = useState<CameraState>('checking')
  const [mountError, setMountError] = useState('')

  const safelyCheckCameraAvailability = async () => {
    try {
      // The method isAvailableAsync is available at runtime only in web platform
      // On other platforms it's handled natively during request and it's implicitly considered as available
      return await (Camera as WebCameraType).isAvailableAsync()
    } catch (error) {
      console.warn('Camera availability check failed', error)
      return true
    }
  }

  const checkAvailability = useCallback(
    async (permission?: PermissionResponse) => {
      const available = await safelyCheckCameraAvailability()

      if (!available) {
        setCameraState('unavailable')
        return
      }

      const currentPermission =
        permission ?? (await Camera.getCameraPermissionsAsync())

      if (!currentPermission?.granted) {
        setCameraState('permission-denied')
        return
      }

      if (currentPermission?.granted) {
        setCameraState('available')
        return
      }
    },
    []
  )

  useEffect(() => {
    checkAvailability()

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkAvailability()
    })

    return subscription.remove
  }, [checkAvailability])

  const requestAndCheck = async () => {
    setMountError('')
    const next = await Camera.requestCameraPermissionsAsync()
    await checkAvailability(next)
  }

  const showPreview = cameraState === 'available'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Availability + Mount Guard</Text>
      <Text style={styles.state}>State: {cameraState}</Text>

      {showPreview ? (
        <CameraView
          facing="front"
          onMountError={(event: CameraMountError) => {
            setMountError(event.message)
            setCameraState('mount-error')
          }}
          style={styles.preview}
        />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preview fallback</Text>
          <Text style={styles.cardBody}>
            Permission alone is not enough. Availability and mount status must
            both succeed.
          </Text>
          {!!mountError && (
            <Text style={styles.error}>Mount error: {mountError}</Text>
          )}
        </View>
      )}

      <Pressable onPress={requestAndCheck} style={styles.button}>
        <Text style={styles.buttonText}>Request permission + retry</Text>
      </Pressable>

      <Pressable
        onPress={() => checkAvailability()}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>
          Recheck camera availability
        </Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openSettings()}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Open Settings</Text>
      </Pressable>

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
  preview: {
    borderRadius: 12,
    width: '100%',
    aspectRatio: 16 / 9,
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
  error: {
    color: '#b91c1c',
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
})
