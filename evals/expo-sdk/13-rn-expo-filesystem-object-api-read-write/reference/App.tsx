import { Directory, File, Paths } from 'expo-file-system'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const noteFile = useMemo(() => new File(new Directory(Paths.cache, 'notes'), 'daily.txt'), [])
  const [text, setText] = useState('No note loaded.')

  const save = async () => {
    const dir = new Directory(Paths.cache, 'notes')
    dir.create({ idempotent: true, intermediates: true })
    noteFile.write('Expo SDK 56 file-system note')
    setText(await noteFile.text())
  }

  const load = async () => {
    try {
      setText(await noteFile.text())
    } catch {
      setText('No note exists yet.')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>File note</Text>
      <Text style={styles.subtitle}>{text}</Text>
      <Pressable onPress={save} style={styles.action}><Text style={styles.actionText}>Save</Text></Pressable>
      <Pressable onPress={load} style={styles.action}><Text style={styles.actionText}>Load</Text></Pressable>
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
