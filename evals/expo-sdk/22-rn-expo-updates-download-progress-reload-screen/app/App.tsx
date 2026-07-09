import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function App() {
  const [status, setStatus] = useState('Up to date.')

  const checkForUpdate = async () => {
    // Check for an available update, download it, and apply it.
    setStatus('Checking…')
  }

  const isDownloading = false
  const downloadProgress = 0

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>App updates</Text>

      {isDownloading ? (
        <View style={styles.progressRow}>
          <ActivityIndicator />
          <Text style={styles.status}>
            Downloading {Math.round(downloadProgress * 100)}%
          </Text>
        </View>
      ) : (
        <Text style={styles.status}>{status}</Text>
      )}

      <Pressable style={styles.button} onPress={checkForUpdate}>
        <Text style={styles.buttonText}>Check for updates</Text>
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
  progressRow: {
    alignItems: 'center',
    columnGap: 10,
    flexDirection: 'row',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  status: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
