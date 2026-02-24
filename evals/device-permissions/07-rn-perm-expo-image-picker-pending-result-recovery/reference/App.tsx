import {
  getPendingResultAsync,
  ImagePickerErrorResult,
  ImagePickerResult,
  launchImageLibraryAsync,
} from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

type PickerState = 'idle' | 'cancelled' | 'error' | 'success'

function isImagePickerErrorResult(
  result: ImagePickerResult | ImagePickerErrorResult
): result is ImagePickerErrorResult {
  return (result as ImagePickerErrorResult).code !== undefined
}

export default function App() {
  const [pickerState, setPickerState] = useState<PickerState>('idle')
  const [message, setMessage] = useState('')
  const [assetSummary, setAssetSummary] = useState('')
  const lastHandledKey = useRef<string | null>(null)

  const handlePickerResult = (
    result: ImagePickerResult,
    source: 'pending' | 'live'
  ) => {
    if (result.canceled) {
      setPickerState('cancelled')
      setAssetSummary('')
      setMessage(`${source} picker result was canceled.`)
      return
    }

    if (result.assets.length === 0) {
      setPickerState('error')
      setAssetSummary('')
      setMessage(`${source} picker result had no assets.`)
      return
    }

    const first = result.assets[0]
    if (pickerState === 'success' && first.uri === lastHandledKey.current) {
      setMessage(`Skipped duplicate ${source} result.`)
      return
    }

    lastHandledKey.current = first.uri
    setPickerState('success')
    setAssetSummary(`${first.fileName ?? 'unnamed'} | ${first.uri}`)
    setMessage(
      `${source} picker result restored through shared success pipeline.`
    )
  }

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    let active = true

    const restorePendingResult = async () => {
      const pendingResult = await getPendingResultAsync()
      if (!active || !pendingResult) {
        return
      }

      if (isImagePickerErrorResult(pendingResult)) {
        setPickerState('error')
        setMessage(pendingResult.message)
      } else {
        handlePickerResult(pendingResult, 'pending')
      }
    }

    restorePendingResult()

    return () => {
      active = false
    }
  }, [handlePickerResult])

  const openPicker = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      selectionLimit: 1,
    })
    handlePickerResult(result, 'live')
  }

  const summary = assetSummary ?? 'No selected asset.'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Android Pending Picker Recovery</Text>
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
