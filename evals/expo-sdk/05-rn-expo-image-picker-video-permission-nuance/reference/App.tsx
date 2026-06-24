import * as ImagePicker from 'expo-image-picker'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [status, setStatus] = useState('Permission not requested.')
  const [videoUri, setVideoUri] = useState<string | null>(null)

  const pickVideo = async () => {
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync()
    const permission = existing.granted ? existing : await ImagePicker.requestMediaLibraryPermissionsAsync(false)
    if (!permission.granted) {
      setStatus(permission.canAskAgain ? 'Video access denied.' : 'Open settings to enable video access.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], videoMaxDuration: 60 })
    const asset = !result.canceled && result.assets?.[0]?.type === 'video' ? result.assets[0] : null
    setVideoUri(asset?.uri ?? null)
    setStatus(asset ? `Selected ${Math.round((asset.duration ?? 0) / 1000)}s video.` : 'No video selected.')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Video picker</Text>
      <Text style={styles.subtitle}>{status}</Text>
      <Text style={styles.subtitle}>{videoUri ?? 'No video uri'}</Text>
      <Pressable onPress={pickVideo} style={styles.action}><Text style={styles.actionText}>Choose video</Text></Pressable>
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
