import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker'

type PickerState = 'idle' | 'cancelled' | 'error' | 'success'

export default function App() {
  const [pickerState, setPickerState] = useState<PickerState>('idle')
  const [message, setMessage] = useState('')
  const [asset, setAsset] = useState<Asset | null>(null)

  const handleResponse = useCallback((response: ImagePickerResponse) => {
    setAsset(null)

    if (response.didCancel) {
      setPickerState('cancelled')
      setMessage('Picker canceled by user.')
      return
    }

    if (response.errorCode) {
      setPickerState('error')

      if (response.errorCode === 'camera_unavailable') {
        setMessage('Camera is unavailable. Try gallery instead.')
        return
      }

      if (response.errorCode === 'permission') {
        setMessage('Permission denied. Grant access from settings.')
        return
      }

      setMessage(`Picker error: ${response.errorMessage ?? response.errorCode}`)
      return
    }

    const firstAsset = response.assets?.[0]
    if (!firstAsset) {
      setPickerState('error')
      setMessage('No assets returned from picker.')
      return
    }

    setPickerState('success')
    setAsset(firstAsset)
    setMessage('Asset selected successfully.')
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>react-native-image-picker</Text>
      <Text style={styles.status}>State: {pickerState}</Text>

      <Pressable
        onPress={async () => {
          const response = await launchCamera({ mediaType: 'photo' })
          handleResponse(response)
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Open camera</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          const response = await launchImageLibrary({ mediaType: 'photo' })
          handleResponse(response)
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Open gallery</Text>
      </Pressable>

      {asset ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected asset</Text>
          <Text>URI: {asset.uri ?? 'n/a'}</Text>
          <Text>Name: {asset.fileName ?? 'unnamed'}</Text>
          <Text>Type: {asset.type ?? 'unknown'}</Text>
        </View>
      ) : (
        <Text style={styles.fallback}>No selected asset to display.</Text>
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
  status: {
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
