import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

export default function App() {
  const [cameraPermission, requestCamera] = useCameraPermissions()
  const [micPermission, requestMic] = useMicrophonePermissions()
  const [recordAudio, setRecordAudio] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const lastScanRef = useRef<string | null>(null)
  const cameraRef = useRef<CameraView>(null)

  const handleToggleAudio = async (value: boolean) => {
    if (!value) {
      setRecordAudio(false)
      return
    }
    const result = micPermission?.granted ? micPermission : await requestMic()
    setRecordAudio(result.granted)
  }

  const handleStartRecording = async () => {
    if (!cameraPermission?.granted) {
      await requestCamera()
      return
    }
    await cameraRef.current?.recordAsync()
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Scanner</Text>

      <View style={styles.preview}>
        {cameraPermission?.granted ? (
          <CameraView
            ref={cameraRef}
            mode="video"
            mute={!recordAudio}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13'] }}
            onBarcodeScanned={(event) => {
              if (event.data === lastScanRef.current) return
              lastScanRef.current = event.data
              setLastScan(event.data)
            }}
            style={styles.camera}
          />
        ) : (
          <>
            <View style={styles.scanFrame} />
            <Text style={styles.previewText}>Point at a barcode</Text>
          </>
        )}
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Last scan</Text>
        <Text style={styles.resultValue}>{lastScan ?? '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Record audio</Text>
        <Switch value={recordAudio} onValueChange={handleToggleAudio} />
      </View>

      <Pressable style={styles.button} onPress={handleStartRecording}>
        <Text style={styles.buttonText}>
          {cameraPermission?.granted ? 'Record Video' : 'Enable Camera'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  preview: {
    alignItems: 'center',
    aspectRatio: 3 / 4,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    rowGap: 12,
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
  },
  resultLabel: {
    color: '#6b7280',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultValue: {
    color: '#111827',
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#111827',
    fontSize: 16,
  },
  scanFrame: {
    borderColor: '#22c55e',
    borderRadius: 8,
    borderWidth: 2,
    height: 120,
    width: 180,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
