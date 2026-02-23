import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { launchCamera, type Asset } from 'react-native-image-picker'
import {
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

const isLegacyAndroid = Platform.OS === 'android' && Number(Platform.Version) <= 28

const LEGACY_STORAGE_PERMISSION: Permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE

function isGranted(status: PermissionStatus): boolean {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED
}

export default function App() {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [message, setMessage] = useState('')
  const [saveMode, setSaveMode] = useState<'saving-enabled' | 'capture-only'>('saving-enabled')

  const capture = useCallback(async () => {
    let canSaveToPhotos = true

    if (isLegacyAndroid) {
      const storage = await request(LEGACY_STORAGE_PERMISSION)
      if (!isGranted(storage)) {
        canSaveToPhotos = false
        setSaveMode('capture-only')
        setMessage('Legacy Android storage denied. Capturing without save-to-photos.')
      } else {
        setSaveMode('saving-enabled')
      }
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

    const firstAsset = response.assets?.[0]
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
  }, [])

  const modeLabel = useMemo(() => {
    if (saveMode === 'saving-enabled') {
      return 'saveToPhotos enabled'
    }

    return 'degraded capture-only mode'
  }, [saveMode])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture and Save Flow</Text>
      <Text style={styles.state}>Mode: {modeLabel}</Text>

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
