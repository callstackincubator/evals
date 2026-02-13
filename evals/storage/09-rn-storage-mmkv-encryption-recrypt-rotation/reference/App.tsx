import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MMKV } from 'react-native-mmkv'

const ENCRYPTION_KEYS = {
  current: 'enc-key-v1',
  next: 'enc-key-v2',
  recovery: 'enc-key-recovery',
}

const secureStorage = new MMKV({
  encryptionKey: ENCRYPTION_KEYS.current,
  id: 'encrypted-user-data',
})

const SECRET_KEY = 'secret:token'

function readSecretValue() {
  try {
    return {
      ok: true,
      value: secureStorage.getString(SECRET_KEY) ?? '',
    }
  } catch {
    return {
      ok: false,
      value: '',
    }
  }
}

function runRecoveryPath() {
  secureStorage.clearAll()
  secureStorage.recrypt(ENCRYPTION_KEYS.recovery)
  secureStorage.set(SECRET_KEY, '')
}

export default function App() {
  const [secret, setSecret] = useState(readSecretValue().value)
  const [activeKey, setActiveKey] = useState('v1')
  const [status, setStatus] = useState('ready')

  const saveSecret = () => {
    secureStorage.set(SECRET_KEY, `token-${Date.now()}`)
    setSecret(readSecretValue().value)
  }

  const rotateKey = () => {
    try {
      setStatus('rotating')
      const snapshot = readSecretValue()
      if (!snapshot.ok) {
        throw new Error('pre-rotation decrypt failure')
      }

      secureStorage.recrypt(ENCRYPTION_KEYS.next)
      const preserved = readSecretValue()
      if (!preserved.ok || preserved.value !== snapshot.value) {
        throw new Error('post-rotation value mismatch')
      }

      setActiveKey('v2')
      setStatus('ready')
    } catch {
      runRecoveryPath()
      setActiveKey('recovery')
      setStatus('recovered')
    }

    setSecret(readSecretValue().value)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encrypted MMKV Rotation</Text>
      <Text style={styles.row}>Active key: {activeKey}</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Secret present: {secret ? 'yes' : 'no'}</Text>

      <Pressable style={styles.button} onPress={saveSecret}>
        <Text style={styles.buttonText}>Write Secret Value</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={rotateKey}>
        <Text style={styles.buttonText}>Rotate Key (recrypt)</Text>
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
