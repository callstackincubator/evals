import { useEffect, useState } from 'react'
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native'
import { MMKV, Mode } from 'react-native-mmkv'

const SHARED_PATH = '/app-group/shared-mmkv'
const SHARED_KEY = 'shared-counter'

const sharedStorage = new MMKV({
  id: 'shared-process-storage',
  mode: Mode.MULTI_PROCESS,
  path: SHARED_PATH,
})

export default function App() {
  const [sharedValue, setSharedValue] = useState(sharedStorage.getNumber(SHARED_KEY) ?? 0)

  const refreshFromSharedStorage = () => {
    setSharedValue(sharedStorage.getNumber(SHARED_KEY) ?? 0)
  }

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshFromSharedStorage()
      }
    })

    return () => {
      appStateSubscription.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MMKV Multi-Process</Text>
      <Text style={styles.row}>Shared path: {SHARED_PATH}</Text>
      <Text style={styles.row}>Shared value: {sharedValue}</Text>

      <Pressable
        style={styles.button}
        onPress={() => {
          sharedStorage.set(SHARED_KEY, sharedValue + 1)
          refreshFromSharedStorage()
        }}
      >
        <Text style={styles.buttonText}>Write Shared Value</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={refreshFromSharedStorage}>
        <Text style={styles.buttonText}>Refresh External Updates</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: {
    color: '#222a3f',
    marginTop: 6,
  },
  title: {
    color: '#111728',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
})
