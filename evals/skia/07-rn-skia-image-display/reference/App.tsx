import { StyleSheet, View } from 'react-native'
import { Canvas, Image, Rect, useImage } from '@shopify/react-native-skia'

const CANVAS_SIZE = 320
const IMAGE_URL = 'https://picsum.photos/320/320'

export default function App() {
  const image = useImage(IMAGE_URL)

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {image ? (
          <Image
            image={image}
            x={0}
            y={0}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            fit='cover'
          />
        ) : (
          <Rect
            x={0}
            y={0}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            color='#334155'
          />
        )}
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
})
