import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createMMKV } from 'react-native-mmkv'
import { Paths } from 'expo-file-system'

const REGISTRY_STORAGE_ID = 'mmkv-path-registry'
const REGISTRY_PATH_KEY = 'configured-path'
const DATA_STORAGE_ID = 'custom-path-storage'

const environment: 'dev' | 'prod' = 'dev'

function stripFileProtocol(uri: string) {
  return uri.replace(/^file:\/\//, '')
}

const basePath = stripFileProtocol(Paths.document.uri)
const configuredPath = `${basePath}${environment}/mmkv`

const registryStorage = createMMKV({ id: REGISTRY_STORAGE_ID })
const dataStorage = createMMKV({
  id: DATA_STORAGE_ID,
  path: configuredPath,
})

function recoverFromPathMismatch(previousPath: string, nextPath: string) {
  const oldStorage = createMMKV({ id: DATA_STORAGE_ID, path: previousPath })
  const newStorage = createMMKV({ id: DATA_STORAGE_ID, path: nextPath })

  newStorage.importAllFrom(oldStorage)
}

export default function App() {
  const [status, setStatus] = useState('booting')
  const [draft, setDraft] = useState(dataStorage.getString('draft') ?? '')

  useEffect(() => {
    const recoverLocalState = () => {
      const draftValue = dataStorage.getString('draft')
      setDraft(draftValue ?? '')
    }

    const currentPath = registryStorage.getString(REGISTRY_PATH_KEY)
    const storagePathChanged = !!currentPath && currentPath !== configuredPath
    if (storagePathChanged) {
      recoverFromPathMismatch(currentPath, configuredPath)
      recoverLocalState()
    }
    registryStorage.set(REGISTRY_PATH_KEY, configuredPath)
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
