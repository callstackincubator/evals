import { StyleSheet, Text, View } from 'react-native'

const DRAG_LIMIT = 170

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Hold, then drag</Text>
        <Text style={styles.subtitle}>
          Long press unlocks dragging and avoids accidental tap-drag.
        </Text>
      </View>
    </View>
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
    backgroundColor: '#ecfeff',
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
