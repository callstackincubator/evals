import * as VideoThumbnails from 'expo-video-thumbnails'
import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const VIDEO_URL = 'https://example.com/demo.mp4'

export default function App() {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null)
  const [message, setMessage] = useState('No thumbnail.')

  const generate = async () => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(VIDEO_URL, {
        time: 1000,
      })
      setThumbnailUri(uri)
      setMessage('Generated thumbnail.')
    } catch (error) {
      setMessage(`Failed: ${String(error)}`)
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Thumbnail</Text>
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.media} />
      ) : (
        <Text style={styles.subtitle}>{message}</Text>
      )}
      <Pressable onPress={generate} style={styles.action}>
        <Text style={styles.actionText}>Generate</Text>
      </Pressable>
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
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
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
