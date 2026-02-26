import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

type SnapPoint = { x: number; y: number }

const SNAP_POINTS: SnapPoint[] = [
  { x: 0, y: 0 },
  { x: -180, y: 0 },
  { x: 180, y: 0 },
  { x: 0, y: -180 },
  { x: 0, y: 180 },
]
const VELOCITY_THRESHOLD = 650

export default function App() {
  return (
    <GestureHandlerRootView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Drag me</Text>
        <Text style={styles.subtitle}>
          Release to snap to nearest point or fling direction
        </Text>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: '100%',
  },
  screen: {
    backgroundColor: '#f0f9ff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    color: '#475569',
    fontSize: 13,
    marginTop: 6,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
})
