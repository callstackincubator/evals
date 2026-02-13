import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import {
  check,
  openPhotoPicker,
  PERMISSIONS,
  request,
  RESULTS,
  type PermissionStatus,
} from 'react-native-permissions'

type PhotoAccess = 'denied' | 'limited' | 'granted' | 'unavailable'

function mapPhotoAccess(status: PermissionStatus): PhotoAccess {
  if (status === RESULTS.UNAVAILABLE) {
    return 'unavailable'
  }

  if (status === RESULTS.GRANTED) {
    return 'granted'
  }

  if (status === RESULTS.LIMITED) {
    return 'limited'
  }

  return 'denied'
}

export default function App() {
  const [photoAccess, setPhotoAccess] = useState<PhotoAccess>('denied')
  const [message, setMessage] = useState('')
  const [assetLabel, setAssetLabel] = useState('No selection yet')

  const refreshAccess = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setPhotoAccess('unavailable')
      setMessage('This eval targets iOS limited photo access behavior.')
      return
    }

    const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
    setPhotoAccess(mapPhotoAccess(status))
  }, [])

  const requestAccess = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setPhotoAccess('unavailable')
      return
    }

    const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
    const nextAccess = mapPhotoAccess(status)
    setPhotoAccess(nextAccess)

    if (nextAccess === 'limited') {
      setMessage('Limited photo access granted. Flow remains usable with restricted selection.')
      return
    }

    if (nextAccess === 'granted') {
      setMessage('Full photo access granted.')
      return
    }

    setMessage('Photo access denied.')
  }, [])

  const openUpgradePicker = useCallback(async () => {
    if (photoAccess !== 'limited') {
      setMessage('Upgrade picker is available from limited state only.')
      return
    }

    try {
      await openPhotoPicker()
      await refreshAccess()
      setMessage('Returned from openPhotoPicker. Re-checking access state.')
    } catch {
      setMessage('openPhotoPicker is unavailable in this environment.')
    }
  }, [photoAccess, refreshAccess])

  const selectPhoto = useCallback(async () => {
    if (photoAccess === 'denied' || photoAccess === 'unavailable') {
      setMessage('Cannot open library without photo permission.')
      return
    }

    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 })

    if (result.didCancel) {
      setMessage('Selection canceled.')
      return
    }

    if (result.errorCode) {
      setMessage(`Picker error: ${result.errorMessage ?? result.errorCode}`)
      return
    }

    const first = result.assets?.[0]
    if (!first) {
      setMessage('No asset returned.')
      return
    }

    setAssetLabel(first.fileName ?? first.uri ?? 'unnamed')
    setMessage(photoAccess === 'limited' ? 'Picked photo in limited mode.' : 'Picked photo in full mode.')
  }, [photoAccess])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Limited Photo Access</Text>
      <Text style={styles.state}>Access: {photoAccess}</Text>

      <Pressable onPress={refreshAccess} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Check access</Text>
      </Pressable>

      <Pressable onPress={requestAccess} style={styles.button}>
        <Text style={styles.buttonText}>Request access</Text>
      </Pressable>

      <Pressable onPress={openUpgradePicker} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Upgrade with openPhotoPicker</Text>
      </Pressable>

      <Pressable onPress={selectPhoto} style={styles.button}>
        <Text style={styles.buttonText}>Select photo</Text>
      </Pressable>

      <Text style={styles.asset}>Selected: {assetLabel}</Text>
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
  asset: {
    color: '#1f2937',
  },
  message: {
    color: '#111827',
    textAlign: 'center',
  },
})
