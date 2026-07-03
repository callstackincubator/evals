import {
  cacheDirectory,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const PROFILE_DIR = `${cacheDirectory}profile/`
const PROFILE_FILE = `${PROFILE_DIR}profile.json`

export default function App() {
  const [message, setMessage] = useState('Ready.')

  const saveProfile = async () => {
    try {
      await makeDirectoryAsync(PROFILE_DIR, { intermediates: true })
      await writeAsStringAsync(PROFILE_FILE, JSON.stringify({ name: 'Expo' }))
      setMessage('Saved profile.')
    } catch (error) {
      setMessage(`Save failed: ${String(error)}`)
    }
  }

  const loadProfile = async () => {
    try {
      const contents = await readAsStringAsync(PROFILE_FILE)
      setMessage(contents)
    } catch (error) {
      setMessage(`Load failed: ${String(error)}`)
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Filesystem helper</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <Pressable onPress={saveProfile} style={styles.action}>
        <Text style={styles.actionText}>Save profile</Text>
      </Pressable>
      <Pressable onPress={loadProfile} style={styles.action}>
        <Text style={styles.actionText}>Load profile</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
