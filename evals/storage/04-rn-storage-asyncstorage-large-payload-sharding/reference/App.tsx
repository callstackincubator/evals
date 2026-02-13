import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type DocManifest = {
  chunkCount: number
  chunkKeys: string[]
  schemaVersion: number
  totalLength: number
}

const DOC_MANIFEST_KEY = 'doc:manifest'
const DOC_CHUNK_PREFIX = 'doc:chunk:'
const DOC_SCHEMA_VERSION = 1
const CHUNK_SIZE = 1024

function createChunks(text: string) {
  const chunks: string[] = []

  for (let index = 0; index < text.length; index += CHUNK_SIZE) {
    chunks.push(text.slice(index, index + CHUNK_SIZE))
  }

  return chunks
}

async function persistShardedDocument(text: string) {
  const chunks = createChunks(text)
  const chunkKeys = chunks.map((_, index) => `${DOC_CHUNK_PREFIX}${index}`)

  const manifest: DocManifest = {
    chunkCount: chunkKeys.length,
    chunkKeys,
    schemaVersion: DOC_SCHEMA_VERSION,
    totalLength: text.length,
  }

  const pairs: [string, string][] = chunkKeys.map((key, index) => [key, chunks[index]])
  pairs.push([DOC_MANIFEST_KEY, JSON.stringify(manifest)])

  await AsyncStorage.multiSet(pairs)
}

async function loadShardedDocument(): Promise<string> {
  const manifestRaw = await AsyncStorage.getItem(DOC_MANIFEST_KEY)
  if (!manifestRaw) {
    return ''
  }

  let manifest: DocManifest
  try {
    manifest = JSON.parse(manifestRaw) as DocManifest
  } catch {
    return ''
  }

  if (manifest.schemaVersion !== DOC_SCHEMA_VERSION) {
    return ''
  }

  const pairs = await AsyncStorage.multiGet(manifest.chunkKeys)
  const chunkMap = Object.fromEntries(pairs)

  const orderedChunks: string[] = []
  for (const key of manifest.chunkKeys) {
    const chunk = chunkMap[key]
    if (typeof chunk !== 'string') {
      await AsyncStorage.multiRemove([...manifest.chunkKeys, DOC_MANIFEST_KEY])
      return ''
    }
    orderedChunks.push(chunk)
  }

  const doc = orderedChunks.join('')
  if (doc.length !== manifest.totalLength) {
    await AsyncStorage.multiRemove([...manifest.chunkKeys, DOC_MANIFEST_KEY])
    return ''
  }

  return doc
}

export default function App() {
  const [document, setDocument] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      setStatus('rehydrating')
      const restored = await loadShardedDocument()
      if (cancelled) {
        return
      }
      setDocument(restored)
      setStatus(restored ? 'restored' : 'fallback-empty')
    }

    restore()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sharded Document</Text>
      <Text style={styles.row}>Chars: {document.length}</Text>
      <Text style={styles.row}>Status: {status}</Text>

      <Pressable
        style={styles.button}
        onPress={async () => {
          const next = `${document} ${'offline-note '.repeat(180)}`
          setDocument(next)
          setStatus('saving')
          await persistShardedDocument(next)
          setStatus('saved')
        }}
      >
        <Text style={styles.buttonText}>Append & Save Large Payload</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: {
    color: '#212942',
    marginTop: 6,
  },
  title: {
    color: '#111728',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
})
