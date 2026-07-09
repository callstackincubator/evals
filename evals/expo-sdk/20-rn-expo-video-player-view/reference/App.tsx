import { useVideoPlayer, VideoView } from 'expo-video'
import { useEffect, useState } from 'react'
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native'

const VIDEO_URL = 'https://example.com/clip.mp4'

export default function App() {
  const [muted, setMuted] = useState(true)
  const [looping, setLooping] = useState(true)

  const player = useVideoPlayer(VIDEO_URL, (nextPlayer) => {
    nextPlayer.loop = true
    nextPlayer.muted = true
  })

  useEffect(() => {
    player.muted = muted
  }, [player, muted])

  useEffect(() => {
    player.loop = looping
  }, [player, looping])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') player.pause()
    })
    return () => {
      subscription.remove()
    }
  }, [player])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Video player</Text>

      <VideoView style={styles.surface} player={player} contentFit="contain" />

      <View style={styles.controls}>
        <Pressable
          style={[styles.toggle, muted && styles.toggleActive]}
          onPress={() => setMuted((current) => !current)}
        >
          <Text style={[styles.toggleText, muted && styles.toggleTextActive]}>
            {muted ? 'Muted' : 'Sound on'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.toggle, looping && styles.toggleActive]}
          onPress={() => setLooping((current) => !current)}
        >
          <Text style={[styles.toggleText, looping && styles.toggleTextActive]}>
            {looping ? 'Looping' : 'No loop'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>{VIDEO_URL}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#6b7280',
  },
  surface: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  toggle: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  toggleText: {
    color: '#334155',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
})
