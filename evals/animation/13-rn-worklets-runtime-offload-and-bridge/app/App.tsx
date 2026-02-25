import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createWorkletRuntime, scheduleOnRN, scheduleOnRuntime } from 'react-native-worklets'

const runtime = createWorkletRuntime('eval-runtime')

function runWorkletPlaceholder(onCommit: (message: string) => void) {
  const worker = () => {
    'worklet'
    scheduleOnRN(onCommit, 'worklet-placeholder-called')
  }

  scheduleOnRuntime(runtime, worker)
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Worklets Starter</Text>
      <Pressable
        style={styles.button}
        onPress={() => runWorkletPlaceholder((message) => console.log(message))}
      >
        <Text style={styles.buttonText}>Run worklet placeholder</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 12,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
})
