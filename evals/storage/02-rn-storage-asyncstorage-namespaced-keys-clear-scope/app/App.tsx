import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const STORAGE_KEY = 'storage:placeholder'

async function loadFromStoragePlaceholder() {
  // TODO: implement async storage read behavior for this eval
  return AsyncStorage.getItem(STORAGE_KEY)
}

async function saveToStoragePlaceholder(value: string) {
  // TODO: implement async storage write behavior for this eval
  return AsyncStorage.setItem(STORAGE_KEY, value)
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>AsyncStorage Starter</Text>
      <Pressable style={styles.button} onPress={() => void loadFromStoragePlaceholder()}>
        <Text style={styles.buttonText}>Load placeholder</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => void saveToStoragePlaceholder('next')}>
        <Text style={styles.buttonText}>Save placeholder</Text>
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
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
