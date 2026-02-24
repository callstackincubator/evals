import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { launchCamera, type Asset } from 'react-native-image-picker'
import {
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type SaveMode = 'saving-enabled' | 'capture-only' | 'capture-denied' | 'undetermined'

const isLegacyAndroid = Platform.OS === 'android' && Number(Platform.Version) <= 28

const LEGACY_STORAGE_PERMISSION: Permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE

const CAMERA_PERMISSION: Permission = Platform.OS == 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA

const IOS_PHOTO_ADD_PERMISSION: Permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY ?? PERMISSIONS.IOS.PHOTO_LIBRARY

function isGranted(status: PermissionStatus): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED
}

export default function App() {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [message, setMessage] = useState('')
  const [saveMode, setSaveMode] = useState<SaveMode>('undetermined')


  const handleSaveMode = async (permission: Permission, denialMessage: string, denialSaveMode: SaveMode = 'capture-only') => {
    const currentPermission = await request(permission)

    if (!isGranted(currentPermission)) {
      setSaveMode(denialSaveMode)
      setMessage(denialMessage)
      return false
    }

    setSaveMode('saving-enabled')
    return true
  }

  const capture = async () => {
    let canSaveToPhotos = await handleSaveMode(CAMERA_PERMISSION ,'Camera permission denied, cannot capture.', 'capture-denied')
    if (!canSaveToPhotos) return

    if (isLegacyAndroid) {
      canSaveToPhotos = await handleSaveMode(LEGACY_STORAGE_PERMISSION ,'Legacy Android storage denied. Capturing without save-to-photos.')
    } else if (Platform.OS === 'ios') {
      canSaveToPhotos = await handleSaveMode(IOS_PHOTO_ADD_PERMISSION ,'Photos permission denied. Capturing without save-to-photos.')
    } else {
      setSaveMode('saving-enabled')
    }

    const response = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: canSaveToPhotos,
    })

    if (response.didCancel) {
      setMessage('Capture canceled.')
      return
    }

    if (response.errorCode) {
      setMessage(`Capture error: ${response.errorMessage ?? response.errorCode}`)
      return
    }

    const firstAsset = response.assets?.length ? response.assets?.[0] : undefined
    if (!firstAsset) {
      setMessage('No capture result returned.')
      return
    }

    setAsset(firstAsset)

    if (!canSaveToPhotos) {
      setMessage('Capture result preserved, but not saved to photos due to permission limits.')
      return
    }

    setMessage('Capture saved to photos successfully.')
  }

  const getModeLabel = () => {
    switch (saveMode) {
      case 'saving-enabled':
        return 'saveToPhotos enabled'
      case 'capture-only':
        return 'degraded capture-only mode'
      case 'capture-denied':
        return 'capture blocked'
      case 'undetermined':
      default:
        return 'status unknown'
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture and Save Flow</Text>
      <Text style={styles.state}>Mode: {getModeLabel()}</Text>

      <Pressable onPress={capture} style={styles.button}>
        <Text style={styles.buttonText}>Capture photo</Text>
      </Pressable>

      {asset ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Capture result</Text>
          <Text>URI: {asset.uri ?? 'n/a'}</Text>
          <Text>Name: {asset.fileName ?? 'unnamed'}</Text>
        </View>
      ) : (
        <Text style={styles.fallback}>No capture yet.</Text>
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
