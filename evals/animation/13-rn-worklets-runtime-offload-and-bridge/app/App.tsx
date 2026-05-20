import { Pressable, StyleSheet, Text, View } from 'react-native'

const TOTAL_BATCHES = 20
const BATCH_SIZE = 3000
const BRIDGE_EVERY_N_BATCHES = 4

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Offload compute to worklets runtime</Text>
      <Text style={styles.status}>Idle</Text>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Run compute</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressFill: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    height: '100%',
    width: '25%',
  },
  progressTrack: {
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#dbeafe',
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
