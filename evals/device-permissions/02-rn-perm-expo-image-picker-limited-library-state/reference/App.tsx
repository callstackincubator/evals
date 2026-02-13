import * as ImagePicker from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type LibraryState = 'unknown' | 'granted' | 'limited' | 'denied'

type SelectedMedia = {
  id: string
  label: string
  uri: string
}

function getLibraryState(permission: ImagePicker.MediaLibraryPermissionResponse): LibraryState {
  if (!permission.granted) {
    return 'denied'
  }

  if (permission.accessPrivileges === 'limited') {
    return 'limited'
  }

  return 'granted'
}

export default function App() {
  const [libraryState, setLibraryState] = useState<LibraryState>('unknown')
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null)
  const [message, setMessage] = useState('')

  const ensurePermission = useCallback(async () => {
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync()
    if (existing.granted || existing.canAskAgain) {
      const finalStatus = existing.granted
        ? existing
        : await ImagePicker.requestMediaLibraryPermissionsAsync()
      const nextState = getLibraryState(finalStatus)
      setLibraryState(nextState)
      return nextState
    }

    setLibraryState('denied')
    return 'denied' as const
  }, [])

  const pickImage = useCallback(async () => {
    setMessage('')
    const state = await ensurePermission()

    if (state === 'denied') {
      setMessage('Media access denied. Open settings or retry permission request.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      selectionLimit: 1,
    })

    if (result.canceled) {
      setMessage('Selection canceled.')
      return
    }

    const asset = result.assets[0]
    if (!asset) {
      setMessage('No media returned. Please try again.')
      return
    }

    const safeId = asset.assetId ?? `fallback-${asset.uri}`
    const safeLabel = asset.fileName ?? 'Unnamed asset (limited metadata)'

    setSelectedMedia({
      id: safeId,
      label: safeLabel,
      uri: asset.uri,
    })

    if (state === 'limited') {
      setMessage('Limited media access active. Showing deterministic fallback metadata.')
    } else {
      setMessage('Media selected with full access.')
    }
  }, [ensurePermission])

  const banner = useMemo(() => {
    switch (libraryState) {
      case 'granted':
        return 'Full media library access'
      case 'limited':
        return 'Limited media access: selection still works with partial metadata'
      case 'denied':
        return 'Media library denied'
      default:
        return 'Permission not checked yet'
    }
  }, [libraryState])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo Image Picker Permission Flow</Text>
      <Text style={styles.banner}>{banner}</Text>

      <Pressable onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick image</Text>
      </Pressable>

      {selectedMedia ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected media</Text>
          <Text>ID: {selectedMedia.id}</Text>
          <Text>Label: {selectedMedia.label}</Text>
          <Text numberOfLines={1}>URI: {selectedMedia.uri}</Text>
        </View>
      ) : (
        <Text style={styles.fallback}>No image selected yet.</Text>
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
    textAlign: 'center',
  },
  banner: {
    color: '#374151',
    textAlign: 'center',
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
    color: '#1f2937',
    textAlign: 'center',
  },
})
