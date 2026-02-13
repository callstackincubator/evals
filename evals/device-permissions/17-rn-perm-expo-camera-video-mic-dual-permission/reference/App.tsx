import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useState } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

type PermissionState = 'granted' | 'denied' | 'blocked' | 'unknown'

function toPermissionState(granted: boolean, canAskAgain: boolean | undefined): PermissionState {
  if (granted) {
    return 'granted'
  }

  if (canAskAgain === false) {
    return 'blocked'
  }

  if (canAskAgain === true) {
    return 'denied'
  }

  return 'unknown'
}

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions()
  const [message, setMessage] = useState('')

  const cameraState = toPermissionState(
    cameraPermission?.granted ?? false,
    cameraPermission?.canAskAgain
  )
  const microphoneState = toPermissionState(
    microphonePermission?.granted ?? false,
    microphonePermission?.canAskAgain
  )

  const requestBoth = useCallback(async () => {
    const [camera, microphone] = await Promise.all([
      requestCameraPermission(),
      requestMicrophonePermission(),
    ])

    if (camera.granted && microphone.granted) {
      setMessage('Both permissions granted. Recording enabled.')
      return
    }

    if (camera.granted || microphone.granted) {
      setMessage('Partial grant detected. Recording disabled, degraded guidance shown.')
      return
    }

    setMessage('Permissions denied or blocked. Retry request or open settings.')
  }, [requestCameraPermission, requestMicrophonePermission])

  const canRecord = cameraState === 'granted' && microphoneState === 'granted'

  const degradedReason = useMemo(() => {
    if (canRecord) {
      return 'Ready to record video'
    }

    if (cameraState === 'granted' && microphoneState !== 'granted') {
      return 'Camera granted, microphone missing. Show mute-only preview fallback.'
    }

    if (cameraState !== 'granted' && microphoneState === 'granted') {
      return 'Microphone granted, camera missing. Show audio-only fallback.'
    }

    return 'Both camera and microphone are required for recording.'
  }, [canRecord, cameraState, microphoneState])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dual Permission Video Flow</Text>
      <Text style={styles.state}>Camera: {cameraState}</Text>
      <Text style={styles.state}>Microphone: {microphoneState}</Text>

      <Pressable onPress={requestBoth} style={styles.button}>
        <Text style={styles.buttonText}>Request camera + microphone</Text>
      </Pressable>

      <Pressable
        disabled={!canRecord}
        onPress={() => setMessage('Recording started.')}
        style={[styles.button, !canRecord && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>Start recording</Text>
      </Pressable>

      <Pressable onPress={() => Linking.openSettings()} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Open settings</Text>
      </Pressable>

      <Text style={styles.degraded}>{degradedReason}</Text>
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
  degraded: {
    color: '#4b5563',
    textAlign: 'center',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
