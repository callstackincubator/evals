import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const player = useAudioPlayer('https://example.com/preview.mp3', { updateInterval: 250 })
  const status = useAudioPlayerStatus(player)

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true })
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
      <Text style={styles.title}>Audio preview</Text>
      <Text style={styles.subtitle}>{status.playing ? 'Playing' : 'Paused'}</Text>
      <Pressable onPress={() => player.play()} style={styles.action}><Text style={styles.actionText}>Play</Text></Pressable>
      <Pressable onPress={() => player.pause()} style={styles.action}><Text style={styles.actionText}>Pause</Text></Pressable>
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
