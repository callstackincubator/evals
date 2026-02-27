import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const MAX_SCALE = 3
const MIN_SCALE = 1
const VIEWPORT_SIZE = 280

export default function App() {
  return (
    <GestureHandlerRootView style={styles.screen}>
      <Text style={styles.title}>Pinch + pan photo canvas</Text>
      <View style={styles.canvas}>
        <Text style={styles.canvasLabel}>Zoom and drag me</Text>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 280,
    justifyContent: 'center',
    width: 280,
  },
  canvasLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
})
