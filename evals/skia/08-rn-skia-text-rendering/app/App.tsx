import { Platform } from 'react-native'
import { Canvas, Fill } from '@shopify/react-native-skia'

const FONT_SIZE = 18

const fontStyle = {
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'serif' }),
  fontSize: FONT_SIZE,
  fontWeight: 'bold',
} as const

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#1e293b" />
    </Canvas>
  )
}
