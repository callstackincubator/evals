import { Directory, File, Paths } from 'expo-file-system'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [status, setStatus] = useState('Idle.')

  const sync = async () => {
    try {
      const downloads = new Directory(Paths.cache, 'downloads')
      downloads.create({ idempotent: true, intermediates: true })
      const file = await File.downloadFileAsync('https://example.com/report.txt', downloads)
      const body = new FormData()
      body.append('file', file as unknown as Blob)
      await fetch('https://example.com/upload', { body, method: 'POST' })
      setStatus(`Uploaded ${file.name}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Sync failed.')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>File sync</Text>
      <Text style={styles.subtitle}>{status}</Text>
      <Pressable onPress={sync} style={styles.action}><Text style={styles.actionText}>Sync</Text></Pressable>
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
