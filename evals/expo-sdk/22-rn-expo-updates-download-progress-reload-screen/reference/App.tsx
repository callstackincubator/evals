import * as Updates from 'expo-updates'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function App() {
  const {
    currentlyRunning,
    isDownloading,
    downloadProgress,
    isUpdateAvailable,
    isUpdatePending,
    downloadError,
  } = Updates.useUpdates()
  const [status, setStatus] = useState(
    currentlyRunning.isEmbeddedLaunch
      ? 'Running embedded build.'
      : 'Up to date.'
  )

  const checkForUpdate = async () => {
    setStatus('Checking…')
    try {
      const update = await Updates.checkForUpdateAsync()
      if (!update.isAvailable) {
        setStatus('Up to date.')
        return
      }
      setStatus('Downloading…')
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
      // Execution does not reliably continue after reloadAsync resolves.
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Update failed.')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>App updates</Text>

      {isDownloading ? (
        <View style={styles.progressRow}>
          <ActivityIndicator />
          <Text style={styles.status}>
            Downloading {Math.round((downloadProgress ?? 0) * 100)}%
          </Text>
        </View>
      ) : (
        <Text style={styles.status}>
          {downloadError
            ? downloadError.message
            : isUpdatePending
              ? 'Update ready. Reloading…'
              : isUpdateAvailable
                ? 'Update available.'
                : status}
        </Text>
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
