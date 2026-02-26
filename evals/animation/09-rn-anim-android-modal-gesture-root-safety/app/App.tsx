import { Pressable, StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function App() {
  return (
    <GestureHandlerRootView style={styles.screen}>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Open gesture modal</Text>
      </Pressable>
      <View style={styles.sheetPreview}>
        <Text style={styles.sheetTitle}>Drag down to dismiss</Text>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 14,
  },
  sheetPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minHeight: 120,
    padding: 16,
    width: '100%',
  },
  sheetTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
})
