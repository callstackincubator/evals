import { useVideoPlayer, VideoView } from 'expo-video'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const player = useVideoPlayer('https://example.com/demo.mp4', (nextPlayer) => {
    nextPlayer.loop = true
    nextPlayer.muted = true
  })

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') player.pause()
    })
    return () => {
      player.pause()
      sub.remove()
    }
  }, [player])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Video</Text>
      <VideoView contentFit="contain" fullscreenOptions={{ enable: true }} player={player} style={styles.media} />
      <Pressable onPress={() => player.play()} style={styles.action}><Text style={styles.actionText}>Play</Text></Pressable>
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
