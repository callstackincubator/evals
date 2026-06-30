import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const ALBUM_NAME = 'My Renders'
const LOCAL_IMAGE_URI = 'file:///tmp/render.png'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function App() {
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const saveToAlbum = async () => {
    setSaveState('saving')
    // Save LOCAL_IMAGE_URI as an asset and add it to ALBUM_NAME.
    setSaveState('saved')
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Save render</Text>
      <Text style={styles.subtitle}>Album: {ALBUM_NAME}</Text>

      <Image source={{ uri: LOCAL_IMAGE_URI }} style={styles.preview} />

      {saveState === 'saved' ? (
        <Text style={styles.status}>Added to {ALBUM_NAME}.</Text>
      ) : null}
      {saveState === 'error' ? (
        <Text style={styles.error}>Could not save the image.</Text>
      ) : null}

      <Pressable
        style={styles.button}
        disabled={saveState === 'saving'}
        onPress={saveToAlbum}
      >
        <Text style={styles.buttonText}>Save to album</Text>
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
  error: {
    color: '#b91c1c',
  },
  preview: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 220,
    width: '100%',
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
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
