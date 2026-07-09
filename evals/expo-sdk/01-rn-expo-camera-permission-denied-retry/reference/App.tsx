import { CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useState } from 'react'
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [permission, requestPermission, getPermission] = useCameraPermissions()
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void getPermission()
    })
    return () => sub.remove()
  }, [getPermission])

  const blocked = permission?.granted === false && permission.canAskAgain === false

  const handleRequestPermission = async () => {
    if (requesting || blocked) return
    setRequesting(true)
    try {
      await requestPermission()
    } finally {
      setRequesting(false)
    }
  }

  const handleOpenSettings = () => {
    void Linking.openSettings()
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Camera</Text>

      <View style={styles.preview}>
        {permission?.granted ? (
          <CameraView style={styles.camera} facing="back" />
        ) : (
          <Text style={styles.previewText}>Camera is off</Text>
        )}
      </View>

      {blocked ? (
        <View style={styles.statusBlock}>
          <Text style={styles.statusText}>
            Camera access is turned off. Enable it in Settings to continue.
          </Text>
          <Pressable style={styles.button} onPress={handleOpenSettings}>
            <Text style={styles.buttonText}>Open Settings</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.button}
          disabled={requesting}
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>
            {permission?.granted ? 'Camera Enabled' : 'Enable Camera'}
          </Text>
        </Pressable>
      )}
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
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  statusBlock: {
    alignItems: 'center',
    rowGap: 10,
  },
  statusText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
