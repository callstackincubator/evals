import { Camera, CameraView, useCameraPermissions, type CameraMountError } from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type CameraState = 'checking' | 'permission-denied' | 'available' | 'unavailable' | 'mount-error'

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [cameraState, setCameraState] = useState<CameraState>('checking')
  const [mountError, setMountError] = useState('')

  const checkAvailability = useCallback(async () => {
    const available = await Camera.isAvailableAsync()
    setCameraState((previous) => {
      if (!permission?.granted) {
        return 'permission-denied'
      }

      if (!available) {
        return 'unavailable'
      }

      return previous === 'mount-error' ? 'mount-error' : 'available'
    })
  }, [permission?.granted])

  useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  const requestAndCheck = useCallback(async () => {
    const next = await requestPermission()
    if (!next.granted) {
      setCameraState('permission-denied')
      return
    }

    setMountError('')
    await checkAvailability()
  }, [checkAvailability, requestPermission])

  const showPreview = cameraState === 'available' && permission?.granted

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Availability + Mount Guard</Text>
      <Text style={styles.state}>State: {cameraState}</Text>

      {showPreview ? (
        <View style={styles.previewWrap}>
          <CameraView
            facing="back"
            onMountError={(event: CameraMountError) => {
              setMountError(event.message)
              setCameraState('mount-error')
            }}
            style={styles.preview}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preview fallback</Text>
          <Text style={styles.cardBody}>
            Permission alone is not enough. Availability and mount status must both succeed.
          </Text>
          {!!mountError && <Text style={styles.error}>Mount error: {mountError}</Text>}
        </View>
      )}

      <Pressable onPress={requestAndCheck} style={styles.button}>
        <Text style={styles.buttonText}>Request permission + retry</Text>
      </Pressable>

      <Pressable onPress={checkAvailability} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Recheck camera availability</Text>
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
  previewWrap: {
    borderRadius: 12,
    height: 220,
    overflow: 'hidden',
    width: '100%',
  },
  preview: {
    flex: 1,
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
