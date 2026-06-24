import { CameraView, useCameraPermissions } from 'expo-camera'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [permission, requestPermission, getPermission] = useCameraPermissions()
  const [requesting, setRequesting] = useState(false)

  const state = requesting ? 'requesting' : permission?.granted ? 'granted' : permission?.canAskAgain === false ? 'blocked' : 'denied'

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void getPermission()
    })
    return () => sub.remove()
  }, [getPermission])

  const request = async () => {
    if (requesting || state === 'blocked') return
    setRequesting(true)
    try {
      await requestPermission()
    } finally {
      setRequesting(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Camera access</Text>
      {permission?.granted ? <CameraView style={styles.media} facing="back" /> : <Text style={styles.subtitle}>Preview unavailable until camera permission is granted.</Text>}
      <Pressable disabled={requesting} onPress={request} style={styles.action}><Text style={styles.actionText}>Request or retry</Text></Pressable>
      {state === 'blocked' ? <Pressable onPress={() => Linking.openSettings()} style={styles.action}><Text style={styles.actionText}>Open settings</Text></Pressable> : null}
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
