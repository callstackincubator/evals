import { Platform } from 'react-native'
import {
  Canvas,
  Fill,
  Text,
  matchFont,
  useCanvasSize,
} from '@shopify/react-native-skia'

const FONT_SIZE = 32

const fontStyle = {
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'serif' }),
  fontSize: FONT_SIZE,
  fontWeight: 'bold',
} as const

const font = matchFont(fontStyle)

const LABEL = 'Hello, Skia!'

function CenteredText() {
  const {
    size: { width, height },
  } = useCanvasSize()
  const textWidth = font?.getTextWidth(LABEL) ?? 0
  const x = (width - textWidth) / 2
  const y = height / 2 + FONT_SIZE / 2

  return <Text x={x} y={y} text={LABEL} font={font} color="#f8fafc" />
}

export default function App() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#1e293b" />
      <CenteredText />
    </Canvas>
  )
}
