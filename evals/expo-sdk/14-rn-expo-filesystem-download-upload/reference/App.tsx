import { Directory, File, Paths } from 'expo-file-system'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const REMOTE_URL = 'https://example.com/report.pdf'
const UPLOAD_ENDPOINT = 'https://example.com/api/upload'

type Phase = 'idle' | 'downloading' | 'uploading' | 'done' | 'error'

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)

  const transfer = async () => {
    setPhase('downloading')
    setProgress(0)
    try {
      const downloads = new Directory(Paths.cache, 'downloads')
      downloads.create({ idempotent: true, intermediates: true })
      const file = await File.downloadFileAsync(REMOTE_URL, downloads, {
        idempotent: true,
        onProgress: ({ bytesWritten, totalBytes }) => {
          if (totalBytes > 0) {
            setProgress(bytesWritten / totalBytes)
          }
        },
      })

      setPhase('uploading')
      const body = new FormData()
      body.append('file', {
        name: file.name,
        type: 'application/pdf',
        uri: file.uri,
      } as unknown as Blob)
      const response = await fetch(UPLOAD_ENDPOINT, { body, method: 'POST' })
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
      setPhase('done')
    } catch {
      setPhase('error')
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sync report</Text>
      <Text style={styles.subtitle}>{REMOTE_URL}</Text>

      {phase === 'downloading' || phase === 'uploading' ? (
        <View style={styles.progressRow}>
          <ActivityIndicator />
          <Text style={styles.status}>
            {phase === 'downloading'
              ? `Downloading ${Math.round(progress * 100)}%`
              : 'Uploading…'}
          </Text>
        </View>
      ) : null}

      {phase === 'done' ? (
        <Text style={styles.status}>Upload complete.</Text>
      ) : null}
      {phase === 'error' ? (
        <Text style={styles.error}>Transfer failed.</Text>
      ) : null}

      <Pressable style={styles.button} onPress={transfer}>
        <Text style={styles.buttonText}>Download &amp; upload</Text>
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
  error: {
    color: '#b91c1c',
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
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
