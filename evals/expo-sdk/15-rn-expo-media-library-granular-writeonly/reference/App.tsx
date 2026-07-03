import { Directory, File, Paths } from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const GENERATED_IMAGE_URI = 'https://example.com/generated/poster.png'

type SaveState = 'idle' | 'saving' | 'saved' | 'denied'

export default function App() {
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const saveToLibrary = async () => {
    setSaveState('saving')
    const permission = await MediaLibrary.requestPermissionsAsync(true, [
      'photo',
    ])
    if (!permission.granted) {
      setSaveState('denied')
      return
    }
    try {
      const cache = new Directory(Paths.cache, 'posters')
      cache.create({ idempotent: true, intermediates: true })
      const file = await File.downloadFileAsync(GENERATED_IMAGE_URI, cache, {
        idempotent: true,
      })
      await MediaLibrary.Asset.create(file.uri)
      setSaveState('saved')
    } catch {
      setSaveState('denied')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Save poster</Text>

      <Image source={{ uri: GENERATED_IMAGE_URI }} style={styles.preview} />

      {saveState === 'saved' ? (
        <Text style={styles.status}>Saved to your photos.</Text>
      ) : null}
      {saveState === 'denied' ? (
        <Text style={styles.error}>
          Photo access is required to save this image.
        </Text>
      ) : null}

      <Pressable
        style={styles.button}
        disabled={saveState === 'saving'}
        onPress={saveToLibrary}
      >
        <Text style={styles.buttonText}>Save to photos</Text>
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
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
