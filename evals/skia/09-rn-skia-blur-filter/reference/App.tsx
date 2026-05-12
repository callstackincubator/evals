import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Blur, Canvas, Circle, Fill, Rect } from '@shopify/react-native-skia'

const BLUR_LEVELS = [0, 2, 6, 14]

export default function App() {
  const [blurIndex, setBlurIndex] = useState(1)
  const blur = BLUR_LEVELS[blurIndex]

  const cycleBlur = () => setBlurIndex((i) => (i + 1) % BLUR_LEVELS.length)

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill color='#0f172a' />

        <Circle cx={160} cy={180} r={60} color='#22c55e' />

        <Rect x={80} y={260} width={160} height={100} color='#6366f1'>
          {blur > 0 && <Blur blur={blur} />}
        </Rect>
      </Canvas>

      <TouchableOpacity style={styles.button} onPress={cycleBlur}>
        <Text style={styles.buttonText}>
          Blur: {blur === 0 ? 'off' : blur}
        </Text>
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
