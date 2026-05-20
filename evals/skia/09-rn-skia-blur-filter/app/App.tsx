import { StyleSheet } from 'react-native'
import { Canvas, Fill } from '@shopify/react-native-skia'

const BLUR_LEVELS = [0, 2, 6, 14]

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#0f172a" />
    </Canvas>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
  },
  button: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#fff',
  },
})
