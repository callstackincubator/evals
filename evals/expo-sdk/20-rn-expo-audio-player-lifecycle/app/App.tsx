import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const SOUND_URL = 'https://example.com/preview.mp3'

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlayback = () => {
    // Play or pause the audio preview.
    setIsPlaying((current) => !current)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Audio preview</Text>
      <Text style={styles.subtitle}>{SOUND_URL}</Text>

      <View style={styles.statusRow}>
        <View
          style={[styles.dot, isPlaying ? styles.dotPlaying : styles.dotIdle]}
        />
        <Text style={styles.status}>{isPlaying ? 'Playing' : 'Paused'}</Text>
      </View>

      <Pressable style={styles.button} onPress={togglePlayback}>
        <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
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
  },
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  dotIdle: {
    backgroundColor: '#cbd5e1',
  },
  dotPlaying: {
    backgroundColor: '#16a34a',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  status: {
    color: '#4b5563',
  },
  statusRow: {
    alignItems: 'center',
    columnGap: 8,
    flexDirection: 'row',
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
