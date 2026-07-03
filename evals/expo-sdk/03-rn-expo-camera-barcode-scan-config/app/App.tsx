import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [lastScan, setLastScan] = useState<string | null>(null)

  const handleEnableCamera = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Scanner</Text>

      <View style={styles.preview}>
        <View style={styles.scanFrame} />
        <Text style={styles.previewText}>Point at a barcode</Text>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Last scan</Text>
        <Text style={styles.resultValue}>{lastScan ?? '—'}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleEnableCamera}>
        <Text style={styles.buttonText}>Enable Camera</Text>
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
    aspectRatio: 3 / 4,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    justifyContent: 'center',
    rowGap: 12,
    width: '100%',
  },
  previewText: {
    color: '#9ca3af',
  },
  resultLabel: {
    color: '#6b7280',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultValue: {
    color: '#111827',
    fontWeight: '600',
  },
  scanFrame: {
    borderColor: '#22c55e',
    borderRadius: 8,
    borderWidth: 2,
    height: 120,
    width: 180,
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
