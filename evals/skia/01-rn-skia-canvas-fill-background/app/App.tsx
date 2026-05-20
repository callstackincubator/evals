import { Platform } from 'react-native'

const FONT_SIZE = 18

const fontStyle = {
  fontFamily: Platform.select({ ios: 'Helvetica', default: 'serif' }),
  fontSize: FONT_SIZE,
  fontWeight: 'bold',
} as const

export default function App() {
  return <></>
}
