import { Directory, File, Paths } from 'expo-file-system'
import * as LegacyFileSystem from 'expo-file-system/legacy'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [message, setMessage] = useState('Ready.')

  const migrate = async () => {
    const file = new File(Paths.cache, 'profile.json')
    file.write(JSON.stringify({ name: 'Expo' }))
    setMessage(await file.text())
  }

  const readLegacyUri = async (uri: string) => {
    return LegacyFileSystem.readAsStringAsync(uri)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Filesystem migration</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <Pressable onPress={migrate} style={styles.action}><Text style={styles.actionText}>Use object API</Text></Pressable>
      <Pressable onPress={() => void readLegacyUri(new File(new Directory(Paths.cache), 'profile.json').uri)} style={styles.action}><Text style={styles.actionText}>Read legacy uri</Text></Pressable>
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
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
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
