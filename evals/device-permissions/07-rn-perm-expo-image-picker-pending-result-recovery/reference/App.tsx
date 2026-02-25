import * as ImagePicker from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

type PickerState = 'idle' | 'cancelled' | 'error' | 'success'

function getResultKey(result: ImagePicker.ImagePickerResult | ImagePicker.ImagePickerSuccessResult): string {
  if ('canceled' in result && result.canceled) {
    return 'cancelled-result'
  }

  if (!('assets' in result) || result.assets.length === 0) {
    return 'empty-result'
  }

  return result.assets.map((asset) => asset.assetId ?? asset.uri).join('|')
}

export default function App() {
  const [pickerState, setPickerState] = useState<PickerState>('idle')
  const [message, setMessage] = useState('')
  const [assetSummary, setAssetSummary] = useState('')
  const lastHandledKey = useRef('')

  const handlePickerResult = useCallback(
    (result: ImagePicker.ImagePickerResult | ImagePicker.ImagePickerSuccessResult, source: 'pending' | 'live') => {
      const key = getResultKey(result)
      if (key === lastHandledKey.current) {
        setMessage(`Skipped duplicate ${source} result.`)
        return
      }
      lastHandledKey.current = key

      if ('canceled' in result && result.canceled) {
        setPickerState('cancelled')
        setAssetSummary('')
        setMessage(`${source} picker result was canceled.`)
        return
      }

      if (!('assets' in result) || result.assets.length === 0) {
        setPickerState('error')
        setAssetSummary('')
        setMessage(`${source} picker result had no assets.`)
        return
      }

      const first = result.assets[0]
      setPickerState('success')
      setAssetSummary(`${first.fileName ?? 'unnamed'} | ${first.uri}`)
      setMessage(`${source} picker result restored through shared success pipeline.`)
    },
    []
  )

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    let active = true

    const restorePendingResult = async () => {
      const pending = await ImagePicker.getPendingResultAsync()
      if (!active || !pending) {
        return
      }
      handlePickerResult(pending, 'pending')
    }

    restorePendingResult()

    return () => {
      active = false
    }
  }, [handlePickerResult])

  const openPicker = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      selectionLimit: 1,
    })
    handlePickerResult(result, 'live')
  }, [handlePickerResult])

  const summary = useMemo(() => {
    if (!assetSummary) {
      return 'No selected asset.'
    }

    return assetSummary
  }, [assetSummary])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Picker Result Recovery</Text>
      <Text style={styles.status}>State: {pickerState}</Text>

      <Pressable onPress={openPicker} style={styles.button}>
        <Text style={styles.buttonText}>Open image picker</Text>
      </Pressable>

      <Text style={styles.summary}>{summary}</Text>
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
  summary: {
    color: '#1f2937',
    textAlign: 'center',
  },
  message: {
    color: '#4b5563',
    textAlign: 'center',
  },
})
