import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker'
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type CaptureState =
  | 'idle'
  | 'cancelled'
  | 'error'
  | 'success'
  | 'fallback-library'

type PermissionOutcome = 'granted' | 'denied' | 'blocked' | 'unavailable'

const CAMERA_PERMISSION: Permission =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
const MICROPHONE_PERMISSION: Permission =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO

function mapPermissionOutcome(status: PermissionStatus): PermissionOutcome {
  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return 'granted'
  }

  if (status === RESULTS.BLOCKED) {
    return 'blocked'
  }

  if (status === RESULTS.UNAVAILABLE) {
    return 'unavailable'
  }

  return 'denied'
}

function mapPickerPermissionError(response: ImagePickerResponse): string {
  if (response.errorCode !== 'permission') {
    return 'non-permission-error'
  }

  const text = (response.errorMessage ?? '').toLowerCase()
  if (text.includes('microphone')) {
    return 'microphone-permission-error'
  }

  if (text.includes('camera')) {
    return 'camera-permission-error'
  }

  return 'camera-or-microphone-permission-error'
}

async function ensurePermission(permission: Permission) {
  const current = await check(permission)
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
    return 'granted'
  }

  return mapPermissionOutcome(await request(permission))
}

export default function App() {
  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [asset, setAsset] = useState<Asset | null>(null)
  const [message, setMessage] = useState('')

  const fallbackToLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    })

    const [asset] = result.assets ?? []
    if (result.didCancel || !asset) {
      setCaptureState('fallback-library')
      setMessage('Fallback library flow did not return a video.')
      return
    }

    setCaptureState('fallback-library')
    setAsset(asset)
    setMessage('Fallback video selected from library.')
  }

  const handleCameraError = async (response: ImagePickerResponse) => {
    if (response.errorCode === 'camera_unavailable') {
      setMessage('Camera hardware unavailable. Switching to library fallback.')
      await fallbackToLibrary()
      return
    }

    setCaptureState('error')

    const mappedError = mapPickerPermissionError(response)
    if (mappedError !== 'non-permission-error') {
      setMessage(`Permission issue: ${mappedError}.`)
      return
    }

    setMessage(`Capture error: ${response.errorMessage ?? response.errorCode}`)
  }

  const captureVideo = async () => {
    setAsset(null)
    setMessage('')

    const cameraAccess = await ensurePermission(CAMERA_PERMISSION)
    if (cameraAccess === 'unavailable') {
      setCaptureState('error')
      setMessage(
        'Camera unavailable-hardware outcome detected. Switching to library fallback.'
      )
      await fallbackToLibrary()
      return
    }

    if (cameraAccess !== 'granted') {
      setCaptureState('error')
      setMessage('Permission issue: camera-permission-error.')
      return
    }

    const microphoneAccess = await ensurePermission(MICROPHONE_PERMISSION)
    if (microphoneAccess !== 'granted') {
      setCaptureState('error')
      setMessage('Permission issue: microphone-permission-error.')
      return
    }

    const response = await launchCamera({
      mediaType: 'video',
      videoQuality: 'medium',
    })

    if (response.didCancel) {
      setCaptureState('cancelled')
      setMessage('Video capture canceled.')
      return
    }

    if (response.errorCode) {
      await handleCameraError(response)
      return
    }

    const [firstAsset] = response.assets ?? []
    if (!firstAsset) {
      setCaptureState('error')
      setMessage('No video asset returned.')
      return
    }

    setCaptureState('success')
    setAsset(firstAsset)
    setMessage('Video capture succeeded.')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.state}>State: {captureState}</Text>

      <Pressable onPress={captureVideo} style={styles.button}>
        <Text style={styles.buttonText}>Capture video</Text>
      </Pressable>

      {asset ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected video</Text>
          <Text>URI: {asset.uri ?? 'n/a'}</Text>
          <Text>Name: {asset.fileName ?? 'unnamed'}</Text>
          <Text>Type: {asset.type ?? 'unknown'}</Text>
        </View>
      ) : (
        <Text style={styles.fallback}>No video selected yet.</Text>
      )}

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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    rowGap: 4,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '600',
  },
  fallback: {
    color: '#6b7280',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
