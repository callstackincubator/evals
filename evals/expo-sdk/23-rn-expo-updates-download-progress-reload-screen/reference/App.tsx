import * as Updates from 'expo-updates'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const updateState = Updates.useUpdates()
  const [message, setMessage] = useState('Check for updates.')

  const apply = async () => {
    if (!updateState.isUpdatePending) {
      setMessage(updateState.downloadError?.message ?? 'No downloaded update to apply.')
      return
    }
    await Updates.reloadAsync({
      reloadScreenOptions: {
        backgroundColor: '#111827',
        fade: true,
      },
    })
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Updates</Text>
      <Text style={styles.subtitle}>{updateState.isDownloading ? `Downloading ${Math.round((updateState.downloadProgress ?? 0) * 100)}%` : message}</Text>
      <Text style={styles.subtitle}>{updateState.currentlyRunning.isEmbeddedLaunch ? 'Embedded launch' : 'Update launch'}</Text>
      <Pressable onPress={apply} style={styles.action}><Text style={styles.actionText}>Apply update</Text></Pressable>
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
