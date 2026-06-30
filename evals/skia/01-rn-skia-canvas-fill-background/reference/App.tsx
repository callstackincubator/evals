import { Platform } from 'react-native'
import {
  Canvas,
  Fill,
  Text,
  matchFont,
  useCanvasSize,
} from '@shopify/react-native-skia'

const FONT_SIZE = 18

const fontStyle = {
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'serif' }),
  fontSize: FONT_SIZE,
  fontWeight: 'bold',
} as const

const font = matchFont(fontStyle)

function CanvasContent() {
  const { width, height } = useCanvasSize()

  const label = `${Math.round(width)} × ${Math.round(height)}`
  const textX = width / 2 - (font?.getTextWidth(label) ?? 0) / 2
  const textY = height / 2 + FONT_SIZE / 2

  return (
    <>
      <Fill color="#1e293b" />
      <Text x={textX} y={textY} text={label} font={font} color="#f8fafc" />
    </>
  )
}

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <CanvasContent />
    </Canvas>
  )
}
