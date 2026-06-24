import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [cameraPermission, requestCamera] = useCameraPermissions()
  const [micPermission, requestMic] = useMicrophonePermissions()
  const [lastScan, setLastScan] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const lastScanRef = useRef('')

  const enableAudio = async () => {
    const result = await requestMic()
    setAudioEnabled(result.granted)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Scanner</Text>
      {cameraPermission?.granted ? (
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13'] }}
          mode="video"
          mute={!audioEnabled}
          onBarcodeScanned={(event) => {
            if (event.data === lastScanRef.current) return
            lastScanRef.current = event.data
            setLastScan(event.data)
          }}
          style={styles.media}
        />
      ) : <Text style={styles.subtitle}>Grant camera permission to scan.</Text>}
      <Text style={styles.subtitle}>Last scan: {lastScan || 'none'}</Text>
      <Pressable onPress={() => requestCamera()} style={styles.action}><Text style={styles.actionText}>Grant camera</Text></Pressable>
      <Pressable onPress={enableAudio} style={styles.action}><Text style={styles.actionText}>{micPermission?.granted ? 'Audio ready' : 'Enable audio'}</Text></Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
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
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
