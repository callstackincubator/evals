import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [videoUri, setVideoUri] = useState<string | null>(null)

  const handlePickVideo = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Upload Video</Text>

      <View style={styles.preview}>
        {videoUri ? (
          <Text style={styles.previewText} numberOfLines={1}>
            {videoUri}
          </Text>
        ) : (
          <Text style={styles.previewText}>No video selected</Text>
        )}
      </View>

      <Pressable style={styles.button} onPress={handlePickVideo}>
        <Text style={styles.buttonText}>Choose Video</Text>
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
  preview: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
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
