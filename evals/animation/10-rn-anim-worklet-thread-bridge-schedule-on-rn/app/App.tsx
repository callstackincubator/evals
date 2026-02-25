import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Worklet compute + bounded bridge</Text>
      <Text style={styles.status}>Checkpoint: 0/8</Text>
      <View style={styles.meterTrack}>
        <View style={styles.meterFill} />
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  meterFill: {
    backgroundColor: '#0ea5e9',
    borderRadius: 999,
    height: '100%',
    width: '20%',
  },
  meterTrack: {
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#e0f2fe',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 12,
  },
  status: {
    color: '#334155',
    fontSize: 14,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
})
