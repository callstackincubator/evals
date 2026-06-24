import { File, Paths } from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const transparentPng = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
  0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65,
  84, 120, 156, 99, 248, 255, 255, 63, 0, 5, 254, 2, 254, 167, 53, 129, 132,
  0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
])

export default function App() {
  const [message, setMessage] = useState('No asset saved.')

  const save = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo'])
    if (!permission.granted) {
      setMessage('Cannot save without photo permission.')
      return
    }
    const file = new File(Paths.cache, 'generated-photo.png')
    file.write(transparentPng)
    if (!file.exists) {
      setMessage('Generated file was not written.')
      return
    }
    const asset = await MediaLibrary.Asset.create(file.uri)
    const album = await MediaLibrary.Album.get('Exports')
    if (album) {
      await album.add(asset)
    } else {
      await MediaLibrary.Album.create('Exports', [asset], false)
    }
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
