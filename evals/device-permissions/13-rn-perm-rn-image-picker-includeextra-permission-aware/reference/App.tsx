import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { launchImageLibrary, type Asset } from 'react-native-image-picker'
import {
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions'

type PermissionLevel = 'denied' | 'limited' | 'granted'

const PHOTO_PERMISSION: Permission =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.PHOTO_LIBRARY
    : Number(Platform.Version) >= 33
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE

function mapPermission(status: PermissionStatus): PermissionLevel {
  if (Platform.OS === 'ios') {
    if (status === RESULTS.LIMITED) return 'limited'
    if (status === RESULTS.GRANTED) return 'granted'
    return 'denied'
  }
  return status === RESULTS.GRANTED ? 'granted' : 'denied'
}

export default function App() {
  const [permissionLevel, setPermissionLevel] =
    useState<PermissionLevel>('denied')
  const [assetSummary, setAssetSummary] = useState('No image selected')
  const [message, setMessage] = useState('')

  const pickWithExtra = async () => {
    const permission = mapPermission(await request(PHOTO_PERMISSION))
    setPermissionLevel(permission)

    if (permission === 'denied') {
      setMessage('Photo permission denied. Metadata extras are unavailable.')
      return
    }

    const response = await launchImageLibrary({
      includeExtra: true,
      mediaType: 'photo',
      selectionLimit: 1,
    })

    if (response.didCancel) {
      setMessage('User cancelled picker.')
      return
    }

    if (response.errorCode) {
      setMessage(`Picker error: ${response.errorMessage ?? response.errorCode}`)
      return
    }

    const asset: Asset | undefined = response.assets?.[0]
    if (!asset) {
      setMessage('No asset returned.')
      return
    }

    const coreFallback = asset.fileName ?? asset.uri ?? 'unknown-asset'
    const timeLabel = asset.timestamp
      ? `timestamp:${asset.timestamp}`
      : 'timestamp:unavailable'
    const locationLabel = asset.originalPath
      ? `path:${asset.originalPath}`
      : 'path:unavailable'

    setAssetSummary(`${coreFallback} | ${timeLabel} | ${locationLabel}`)

    if (permission === 'limited') {
      setMessage(
        'Limited permission: includeExtra requested, but core asset fallback keeps flow deterministic.'
      )
      return
    }

    setMessage(
      'Full permission: includeExtra metadata used when available, with core-field fallback.'
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rich Photo Metadata</Text>
      <Text style={styles.state}>Permission: {permissionLevel}</Text>

      <Pressable onPress={pickWithExtra} style={styles.button}>
        <Text style={styles.buttonText}>Pick image with includeExtra</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Asset summary</Text>
        <Text>{assetSummary}</Text>
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
