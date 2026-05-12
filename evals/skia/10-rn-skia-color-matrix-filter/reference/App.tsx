import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Canvas, Circle, ColorMatrix, Fill, Group } from '@shopify/react-native-skia'

const GRAYSCALE_MATRIX = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
]

export default function App() {
  const [filtered, setFiltered] = useState(false)

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill color='#f1f5f9' />

        <Group>
          {filtered && <ColorMatrix matrix={GRAYSCALE_MATRIX} />}
          <Circle cx={130} cy={200} r={80} color='#ef4444' />
          <Circle cx={230} cy={200} r={80} color='#3b82f6' />
          <Circle cx={180} cy={290} r={80} color='#22c55e' />
        </Group>
      </Canvas>

      <TouchableOpacity style={styles.button} onPress={() => setFiltered((v) => !v)}>
        <Text style={styles.buttonText}>
          Grayscale: {filtered ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  canvas: {
    flex: 1,
  },
  button: {
    margin: 24,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#64748b',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
