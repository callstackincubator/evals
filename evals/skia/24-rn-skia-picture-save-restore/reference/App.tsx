import { useMemo } from 'react'
import { Canvas, Fill, Picture, Skia } from '@shopify/react-native-skia'

const SIZE = 320
const CX = SIZE / 2
const BACKGROUND_COLOR = '#0f172a'
const FIRST_RECT_COLOR = '#38bdf8'
const AXIS_ALIGNED_RECT_COLOR = '#f472b6'
const THIRD_RECT_COLOR = '#4ade80'
const FIRST_RECT_ROTATION_DEG = 45
const THIRD_RECT_ROTATION_DEG = -23
const RECT_WIDTH = 120
const RECT_HEIGHT = 48

const paint = Skia.Paint()
paint.setAntiAlias(true)

export default function App() {
  const picture = useMemo(() => {
    const recorder = Skia.PictureRecorder()
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, SIZE, SIZE))

    paint.setColor(Skia.Color(FIRST_RECT_COLOR))
    canvas.save()
    canvas.translate(CX, 90)
    canvas.rotate(FIRST_RECT_ROTATION_DEG)
    canvas.drawRect(
      {
        x: -RECT_WIDTH / 2,
        y: -RECT_HEIGHT / 2,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
      },
      paint
    )
    canvas.restore()

    paint.setColor(Skia.Color(AXIS_ALIGNED_RECT_COLOR))
    canvas.drawRect({ x: 40, y: 144, width: 240, height: 32 }, paint)

    paint.setColor(Skia.Color(THIRD_RECT_COLOR))
    canvas.save()
    canvas.translate(CX, 230)
    canvas.rotate(THIRD_RECT_ROTATION_DEG)
    canvas.drawRect(
      {
        x: -RECT_WIDTH / 2,
        y: -RECT_HEIGHT / 2,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
      },
      paint
    )
    canvas.restore()

    return recorder.finishRecordingAsPicture()
  }, [])

  return (
    <Canvas
      style={{ width: SIZE, height: SIZE, alignSelf: 'center', marginTop: 60 }}
    >
      <Fill color={BACKGROUND_COLOR} />
      <Picture picture={picture} />
    </Canvas>
  )
}
