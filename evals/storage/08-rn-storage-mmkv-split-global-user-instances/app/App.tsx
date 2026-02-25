import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV({ id: 'app-storage' })

function readMmkvPlaceholder() {
  // TODO: implement MMKV read/listener behavior for this eval
  return storage.getString('value')
}

function writeMmkvPlaceholder(value: string) {
  // TODO: implement MMKV write/encryption/path behavior for this eval
  storage.set('value', value)
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>MMKV Starter</Text>
      
      <Pressable style={styles.button} onPress={() => readMmkvPlaceholder()}>
        <Text style={styles.buttonText}>Read placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => writeMmkvPlaceholder('next')}>
        <Text style={styles.buttonText}>Write placeholder</Text>
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
    rowGap: 10,
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
