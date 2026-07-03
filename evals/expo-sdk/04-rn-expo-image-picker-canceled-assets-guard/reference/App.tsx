import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [status, setStatus] = useState('No image selected')

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
    })
    if (result.canceled || !result.assets?.length) {
      setImageUri(null)
      setStatus('No image selected')
      return
    }
    setImageUri(result.assets[0].uri)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile Photo</Text>

      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.previewText}>{status}</Text>
        )}
      </View>

      <Pressable style={styles.button} onPress={handlePickImage}>
        <Text style={styles.buttonText}>Choose from Library</Text>
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
    textAlign: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  preview: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
