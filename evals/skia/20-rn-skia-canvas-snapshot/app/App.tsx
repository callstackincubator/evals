import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Canvas, Fill } from '@shopify/react-native-skia'

export default function App() {
  const handleSave = () => {}

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill color="#1e293b" />
      </Canvas>

      <TouchableOpacity style={styles.button}>
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
