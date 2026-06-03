import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Canvas, Circle, Fill, useCanvasRef } from '@shopify/react-native-skia'

export default function App() {
  const ref = useCanvasRef()

  const handleSave = () => {
    const image = ref.current?.makeImageSnapshot()
    if (!image) {
      console.warn('Snapshot failed: canvas ref not ready')
      return
    }
    const bytes = image.encodeToBytes()
    console.log('Snapshot byte length:', bytes.length)
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} ref={ref}>
        <Fill color='#1e293b' />
        <Circle cx={160} cy={200} r={80} color='#38bdf8' />
        <Circle cx={100} cy={320} r={50} color='#f472b6' />
        <Circle cx={220} cy={320} r={50} color='#4ade80' />
      </Canvas>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Snapshot</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  canvas: {
    flex: 1,
  },
  button: {
    margin: 24,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
