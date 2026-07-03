import { useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

export default function App() {
  const [cameraEnabled, setCameraEnabled] = useState(true)

  const handleTakePhoto = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Camera Preview</Text>

      <View style={styles.preview}>
        {cameraEnabled ? (
          <Text style={styles.previewText}>Live preview</Text>
        ) : (
          <Text style={styles.previewText}>Camera paused</Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Camera enabled</Text>
        <Switch value={cameraEnabled} onValueChange={setCameraEnabled} />
      </View>

      <Pressable
        style={[styles.button, !cameraEnabled && styles.buttonDisabled]}
        disabled={!cameraEnabled}
        onPress={handleTakePhoto}
      >
        <Text style={styles.buttonText}>Take Photo</Text>
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
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  preview: {
    alignItems: 'center',
    aspectRatio: 3 / 4,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    justifyContent: 'center',
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#111827',
    fontSize: 16,
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
