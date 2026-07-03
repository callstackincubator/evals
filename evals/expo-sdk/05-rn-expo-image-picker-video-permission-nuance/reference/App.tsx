import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [status, setStatus] = useState('No video selected')
  const [accessNotice, setAccessNotice] = useState<string | null>(null)

  const handlePickVideo = async () => {
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync()
    const permission = existing.granted
      ? existing
      : await ImagePicker.requestMediaLibraryPermissionsAsync(false)
    if (!permission.granted) {
      setAccessNotice(
        permission.canAskAgain
          ? 'Video access denied'
          : 'Enable video access in Settings'
      )
      return
    }
    setAccessNotice(
      permission.accessPrivileges === 'limited'
        ? 'Limited library access — only selected videos are available'
        : null
    )
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
    })
    const asset =
      !result.canceled && result.assets?.[0]?.type === 'video'
        ? result.assets[0]
        : null
    if (!asset) {
      setVideoUri(null)
      setStatus('No video selected')
      return
    }
    setVideoUri(asset.uri)
    setStatus(`Selected ${Math.round((asset.duration ?? 0) / 1000)}s video`)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Upload Video</Text>

      <View style={styles.preview}>
        {videoUri ? (
          <Text style={styles.previewText} numberOfLines={1}>
            {videoUri}
          </Text>
        ) : (
          <Text style={styles.previewText}>{status}</Text>
        )}
      </View>

      {accessNotice ? <Text style={styles.status}>{accessNotice}</Text> : null}

      {videoUri ? <Text style={styles.status}>{status}</Text> : null}

      <Pressable style={styles.button} onPress={handlePickVideo}>
        <Text style={styles.buttonText}>Choose Video</Text>
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
  preview: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
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
  status: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
