import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import {
  Canvas,
  Fill,
  FontStyle,
  Paragraph,
  Skia,
  TextAlign,
} from '@shopify/react-native-skia'

const PARAGRAPH_WIDTH = 300

export default function App() {
  const { width } = useWindowDimensions()

  const paragraph = useMemo(() => {
    const para = Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center })
      .pushStyle({
        fontSize: 28,
        color: Skia.Color('#f8fafc'),
        fontStyle: FontStyle.Bold,
      })
      .addText('React Native Skia\n')
      .pop()
      .pushStyle({
        fontSize: 16,
        color: Skia.Color('#94a3b8'),
        fontStyle: FontStyle.Normal,
      })
      .addText('Paragraph API with mixed styles')
      .build()

    para.layout(PARAGRAPH_WIDTH)
    return para
  }, [])

  const x = (width - PARAGRAPH_WIDTH) / 2
  const y = 120

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#1e293b" />
      <Paragraph paragraph={paragraph} x={x} y={y} width={PARAGRAPH_WIDTH} />
    </Canvas>
  )
}
