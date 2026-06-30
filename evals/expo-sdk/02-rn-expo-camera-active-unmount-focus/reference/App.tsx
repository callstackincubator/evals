import { CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useRef, useState } from 'react'
import { AppState, Pressable, StyleSheet, Switch, Text, View } from 'react-native'

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [appActive, setAppActive] = useState(AppState.currentState === 'active')
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) =>
      setAppActive(state === 'active'),
    )
    return () => sub.remove()
  }, [])

  const cameraActive = Boolean(permission?.granted) && appActive && cameraEnabled

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      await requestPermission()
      return
    }
    await cameraRef.current?.takePictureAsync()
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Camera Preview</Text>

      <View style={styles.preview}>
        {permission?.granted ? (
          cameraActive ? (
            <CameraView ref={cameraRef} active={cameraActive} style={styles.camera} />
          ) : (
            <Text style={styles.previewText}>Camera paused</Text>
          )
        ) : (
          <Text style={styles.previewText}>Camera access required</Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Camera enabled</Text>
        <Switch value={cameraEnabled} onValueChange={setCameraEnabled} />
      </View>

      <Pressable
        style={[styles.button, !cameraEnabled && styles.buttonDisabled]}
        disabled={!cameraEnabled}
        onPress={handleTakePhoto}
      >
        <Text style={styles.buttonText}>
          {permission?.granted ? 'Take Photo' : 'Enable Camera'}
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
  buttonDisabled: {
    backgroundColor: '#9ca3af',
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
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
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
