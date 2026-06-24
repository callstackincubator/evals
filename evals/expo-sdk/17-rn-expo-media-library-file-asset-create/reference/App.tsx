import { File, Paths } from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [message, setMessage] = useState('No asset saved.')

  const save = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo'])
    if (!permission.granted) {
      setMessage('Cannot save without photo permission.')
      return
    }
    const file = new File(Paths.cache, 'generated-photo.txt')
    file.write('placeholder-image-bytes')
    const asset = await MediaLibrary.Asset.create(file.uri)
    const album = (await MediaLibrary.Album.get('Exports')) ?? await MediaLibrary.Album.create('Exports', [asset], false)
    await album.add(asset)
    setMessage(await asset.getFilename())
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Media asset</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <Pressable onPress={save} style={styles.action}><Text style={styles.actionText}>Save asset</Text></Pressable>
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
