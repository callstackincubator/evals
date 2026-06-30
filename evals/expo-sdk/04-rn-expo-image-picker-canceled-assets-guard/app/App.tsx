import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null)

  const handlePickImage = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile Photo</Text>

      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.previewText}>No image selected</Text>
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
