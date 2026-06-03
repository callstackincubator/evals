import { StyleSheet } from 'react-native'
import { Canvas, Fill } from '@shopify/react-native-skia'

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#f1f5f9" />
    </Canvas>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#64748b',
  },
})
