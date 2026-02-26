import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type SettingsState = {
  emailOptIn: boolean
  language: string
  pushOptIn: boolean
}

const SETTINGS_KEYS = {
  emailOptIn: 'settings:email-opt-in',
  language: 'settings:language',
  pushOptIn: 'settings:push-opt-in',
} as const

const DEFAULT_SETTINGS: SettingsState = {
  emailOptIn: false,
  language: 'en',
  pushOptIn: true,
}

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

function mapBatchToSettings(
  pairs: readonly [string, string | null][]
): SettingsState {
  const map = Object.fromEntries(pairs)

  return {
    emailOptIn: parseBoolean(
      map[SETTINGS_KEYS.emailOptIn] ?? null,
      DEFAULT_SETTINGS.emailOptIn
    ),
    language: map[SETTINGS_KEYS.language] ?? DEFAULT_SETTINGS.language,
    pushOptIn: parseBoolean(
      map[SETTINGS_KEYS.pushOptIn] ?? null,
      DEFAULT_SETTINGS.pushOptIn
    ),
  }
}

async function writeSettingsBatch(next: SettingsState, retryAttempts = 2) {
  const entries: [string, string][] = [
    [SETTINGS_KEYS.emailOptIn, String(next.emailOptIn)],
    [SETTINGS_KEYS.language, next.language],
    [SETTINGS_KEYS.pushOptIn, String(next.pushOptIn)],
  ]

  try {
    await AsyncStorage.multiSet(entries)
  } catch {
    for (const [key, value] of entries) {
      let success = false

      for (let attempt = 0; attempt < retryAttempts && !success; attempt += 1) {
        try {
          await AsyncStorage.setItem(key, value)
          success = true
        } catch {
          if (attempt === 1) {
            throw new Error(`Failed to persist ${key} after retries`)
          }
        }
      }
    }
  }
}

export default function App() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    let cancelled = false

    const read = async () => {
      setStatus('rehydrating')
      const pairs = await AsyncStorage.multiGet(Object.values(SETTINGS_KEYS))
      if (cancelled) {
        return
      }

      setSettings(mapBatchToSettings(pairs))
      setStatus('ready')
    }

    void read()

    return () => {
      cancelled = true
    }
  }, [])

  const togglePush = async () => {
    const next = {
      ...settings,
      pushOptIn: !settings.pushOptIn,
    }

    setSettings(next)
    setStatus('saving')
    await writeSettingsBatch(next)
    setStatus('ready')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Batched Settings</Text>
      <Text style={styles.row}>Language: {settings.language}</Text>
      <Text style={styles.row}>Push: {String(settings.pushOptIn)}</Text>
      <Text style={styles.row}>Email: {String(settings.emailOptIn)}</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Pressable style={styles.button} onPress={togglePush}>
        <Text style={styles.buttonText}>Toggle Push</Text>
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
