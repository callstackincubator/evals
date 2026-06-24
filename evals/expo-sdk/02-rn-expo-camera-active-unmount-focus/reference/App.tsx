import { CameraView, useCameraPermissions } from 'expo-camera'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [permission, requestPermission] = useCameraPermissions()
  const [appActive, setAppActive] = useState(AppState.currentState === 'active')
  const [previewEnabled, setPreviewEnabled] = useState(true)

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setAppActive(state === 'active'))
    return () => sub.remove()
  }, [])

  const cameraActive = Boolean(permission?.granted && appActive && previewEnabled)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Lifecycle camera</Text>
      {permission?.granted ? <CameraView active={cameraActive} style={styles.media} /> : <Text style={styles.subtitle}>Camera is not mounted until permission is granted.</Text>}
      <Pressable onPress={() => requestPermission()} style={styles.action}><Text style={styles.actionText}>Grant camera</Text></Pressable>
      <Pressable onPress={() => setPreviewEnabled((value) => !value)} style={styles.action}><Text style={styles.actionText}>{previewEnabled ? 'Pause preview' : 'Resume preview'}</Text></Pressable>
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
