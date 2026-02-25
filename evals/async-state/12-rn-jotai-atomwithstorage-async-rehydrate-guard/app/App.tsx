import AsyncStorage from '@react-native-async-storage/async-storage'
import { StyleSheet, Text, View } from 'react-native'
import { useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const preferenceAtom = atomWithStorage('pref:placeholder', 'default', {
  getItem: (key, initialValue) => AsyncStorage.getItem(key).then((value) => value ?? initialValue),
  setItem: (key, value) => AsyncStorage.setItem(key, String(value)),
  removeItem: (key) => AsyncStorage.removeItem(key),
})

function Screen() {
  const value = useAtomValue(preferenceAtom)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Jotai Storage Starter</Text>
      <Text style={styles.subtitle}>Stored value: {value}</Text>
    </View>
  )
}

export default function App() {
  return <Screen />
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
