import * as ImagePicker from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type PickerState =
  | 'idle'
  | 'camera-cancelled'
  | 'camera-error'
  | 'camera-success'
  | 'fallback-gallery'
  | 'gallery-canceled'

export default function App() {
  const [pickerState, setPickerState] = useState<PickerState>('idle')
  const [message, setMessage] = useState('')
  const [assetUri, setAssetUri] = useState('')

  const fallbackToGallery = async () => {
    const libraryResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      selectionLimit: 1,
    })

    if (libraryResult.canceled || !libraryResult.assets?.length) {
      setPickerState('gallery-canceled')
      setMessage('Fallback to gallery was canceled or returned no assets.')
      return
    }

    setPickerState('fallback-gallery')
    setAssetUri(libraryResult.assets[0].uri)
    setMessage('Camera unavailable. Fallback gallery selection succeeded.')
  }

  const launchCameraWithGuard = async () => {
    setMessage('')
    setAssetUri('')

    const current = await ImagePicker.getCameraPermissionsAsync()
    const permission = current.granted
      ? current
      : await ImagePicker.requestCameraPermissionsAsync()

    if (!permission.granted) {
      setPickerState('camera-error')
      setMessage('Camera permission denied. Use gallery fallback.')
      await fallbackToGallery()
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
      })

      if (result.canceled) {
        setPickerState('camera-cancelled')
        setMessage('Camera capture canceled.')
        return
      }

      if (!result.assets?.length) {
        setPickerState('camera-error')
        setMessage('No image returned from camera.')
        return
      }

      setPickerState('camera-success')
      setAssetUri(result.assets[0].uri)
      setMessage('Camera capture succeeded.')
    } catch {
      setPickerState('camera-error')
      setMessage(
        'Camera unavailable in this environment. Falling back to gallery.'
      )
      await fallbackToGallery()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera with Gallery Fallback</Text>
      <Text style={styles.state}>State: {pickerState}</Text>

      <Pressable onPress={launchCameraWithGuard} style={styles.button}>
        <Text style={styles.buttonText}>Open camera</Text>
      </Pressable>

      <Text style={styles.asset}>
        {assetUri ? `Selected URI: ${assetUri}` : 'No asset selected yet.'}
      </Text>
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
  asset: {
    color: '#1f2937',
    textAlign: 'center',
  },
  message: {
    color: '#4b5563',
    textAlign: 'center',
  },
})
