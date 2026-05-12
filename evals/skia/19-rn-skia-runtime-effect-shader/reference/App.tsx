import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, Fill, Shader, Skia, vec } from '@shopify/react-native-skia'
import { useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const SKSL = `
uniform float2 resolution;
uniform float time;

vec4 main(vec2 pos) {
  vec2 uv = pos / resolution;
  float r = 0.5 + 0.5 * sin(uv.x * 6.28 + time);
  float g = 0.5 + 0.5 * sin(uv.y * 6.28 + time + 2.09);
  float b = 0.5 + 0.5 * sin((uv.x + uv.y) * 3.14 + time + 4.19);
  return vec4(r, g, b, 1.0);
}
`

const source = Skia.RuntimeEffect.Make(SKSL)!

export default function App() {
  const { width, height } = useWindowDimensions()
  const time = useSharedValue(0)

  useEffect(() => {
    time.value = withRepeat(withTiming(Math.PI * 2, { duration: 3000 }), -1, false)
  }, [time])

  const uniforms = useDerivedValue(() => ({
    resolution: vec(width, height),
    time: time.value,
  }))

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  )
}
