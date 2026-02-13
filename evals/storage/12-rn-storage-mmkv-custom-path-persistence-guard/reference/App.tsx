import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MMKV } from 'react-native-mmkv'

const REGISTRY_STORAGE_ID = 'mmkv-path-registry'
const REGISTRY_PATH_KEY = 'configured-path'
const DATA_STORAGE_ID = 'custom-path-storage'
const DATA_KEYS = ['draft', 'session'] as const

function stableStoragePath(environment: 'dev' | 'prod') {
  return environment === 'prod' ? '/app-storage/prod/mmkv' : '/app-storage/dev/mmkv'
}

const environment: 'dev' | 'prod' = 'prod'
const configuredPath = stableStoragePath(environment)

const registryStorage = new MMKV({ id: REGISTRY_STORAGE_ID })
const dataStorage = new MMKV({
  id: DATA_STORAGE_ID,
  path: configuredPath,
})

function recoverFromPathMismatch(previousPath: string, nextPath: string) {
  const oldStorage = new MMKV({ id: DATA_STORAGE_ID, path: previousPath })
  const newStorage = new MMKV({ id: DATA_STORAGE_ID, path: nextPath })

  for (const key of DATA_KEYS) {
    const value = oldStorage.getString(key)
    if (typeof value === 'string') {
      newStorage.set(key, value)
    }
  }
}

function guardStablePath() {
  const previousPath = registryStorage.getString(REGISTRY_PATH_KEY)
  if (previousPath && previousPath !== configuredPath) {
    recoverFromPathMismatch(previousPath, configuredPath)
  }

  registryStorage.set(REGISTRY_PATH_KEY, configuredPath)
}

export default function App() {
  const [status, setStatus] = useState('booting')
  const [draft, setDraft] = useState(dataStorage.getString('draft') ?? '')

  useEffect(() => {
    guardStablePath()
    setStatus('ready')
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MMKV Custom Path Guard</Text>
      <Text style={styles.row}>Configured path: {configuredPath}</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Draft length: {draft.length}</Text>

      <Pressable
        style={styles.button}
        onPress={() => {
          const next = `${draft}*`
          dataStorage.set('draft', next)
          setDraft(next)
        }}
      >
        <Text style={styles.buttonText}>Write Persisted Draft</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: {
    color: '#222a3f',
    marginTop: 6,
  },
  title: {
    color: '#111728',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
})
