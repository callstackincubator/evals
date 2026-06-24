import { Image } from 'expo-image'
import { useVideoPlayer, type VideoThumbnail } from 'expo-video'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const player = useVideoPlayer('https://example.com/demo.mp4')
  const [thumbnail, setThumbnail] = useState<VideoThumbnail | null>(null)
  const [message, setMessage] = useState('No thumbnail.')

  const generate = async () => {
    const thumbnails = await player.generateThumbnailsAsync([1, 3], { maxWidth: 480 })
    const first = thumbnails[0]
    setThumbnail(first ?? null)
    setMessage(first ? `Generated at ${first.actualTime}s` : 'Thumbnail unavailable.')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Thumbnail</Text>
      {thumbnail ? <Image source={thumbnail} style={styles.media} /> : <Text style={styles.subtitle}>{message}</Text>}
      <Pressable onPress={generate} style={styles.action}><Text style={styles.actionText}>Generate</Text></Pressable>
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
