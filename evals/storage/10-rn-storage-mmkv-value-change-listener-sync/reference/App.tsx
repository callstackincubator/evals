import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV({ id: 'listener-storage' })
const COUNTER_KEY = 'counter'

export default function App() {
  const [count, setCount] = useState(storage.getNumber(COUNTER_KEY) ?? 0)

  useEffect(() => {
    const listener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey !== COUNTER_KEY) {
        return
      }

      setCount(storage.getNumber(COUNTER_KEY) ?? 0)
    })

    return () => {
      listener.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MMKV Listener Sync</Text>
      <Text style={styles.row}>Count: {count}</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          storage.set(COUNTER_KEY, count + 1)
        }}
      >
        <Text style={styles.buttonText}>Increment</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 12,
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
