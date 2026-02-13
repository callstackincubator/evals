import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const SCHEMA_VERSION_KEY = 'schema:version'
const LEGACY_PROFILE_KEY = 'profile:v1'
const PROFILE_V2_KEY = 'profile:v2'
const SETTINGS_V3_KEY = 'settings:v3'
const CURRENT_SCHEMA_VERSION = 3

type MigrationResult = {
  fromVersion: number
  toVersion: number
}

function safeParseRecord(value: string | null, fallback: Record<string, unknown>) {
  if (!value) {
    return fallback
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return fallback
  } catch {
    return fallback
  }
}

async function readVersion(): Promise<number> {
  const raw = await AsyncStorage.getItem(SCHEMA_VERSION_KEY)
  if (!raw) {
    return 0
  }

  const parsed = Number(raw)
  if (!Number.isInteger(parsed)) {
    return -1
  }

  return parsed
}

async function resetToCompatibleFallback() {
  await AsyncStorage.multiRemove([LEGACY_PROFILE_KEY, PROFILE_V2_KEY, SETTINGS_V3_KEY])
  await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA_VERSION))
}

async function migrateToV1() {
  const hasLegacyProfile = await AsyncStorage.getItem(LEGACY_PROFILE_KEY)
  if (!hasLegacyProfile) {
    await AsyncStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify({ name: 'Guest' }))
  }
}

async function migrateToV2() {
  const alreadyV2 = await AsyncStorage.getItem(PROFILE_V2_KEY)
  if (alreadyV2) {
    return
  }

  const legacy = await AsyncStorage.getItem(LEGACY_PROFILE_KEY)
  const legacyPayload = safeParseRecord(legacy, { name: 'Guest' })
  const displayName = typeof legacyPayload.name === 'string' ? legacyPayload.name : 'Guest'

  await AsyncStorage.setItem(
    PROFILE_V2_KEY,
    JSON.stringify({
      displayName,
      updatedAt: Date.now(),
    }),
  )
}

async function migrateToV3() {
  const settings = await AsyncStorage.getItem(SETTINGS_V3_KEY)
  if (!settings) {
    await AsyncStorage.setItem(SETTINGS_V3_KEY, JSON.stringify({ locale: 'en-US', theme: 'system' }))
  }
}

async function runMigrations(): Promise<MigrationResult> {
  const startVersion = await readVersion()

  if (startVersion < 0 || startVersion > CURRENT_SCHEMA_VERSION) {
    await resetToCompatibleFallback()
    return { fromVersion: startVersion, toVersion: CURRENT_SCHEMA_VERSION }
  }

  let workingVersion = startVersion

  while (workingVersion < CURRENT_SCHEMA_VERSION) {
    const nextVersion = workingVersion + 1

    if (nextVersion === 1) {
      await migrateToV1()
    }

    if (nextVersion === 2) {
      await migrateToV2()
    }

    if (nextVersion === 3) {
      await migrateToV3()
    }

    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(nextVersion))
    workingVersion = nextVersion
  }

  return {
    fromVersion: startVersion,
    toVersion: workingVersion,
  }
}

export default function App() {
  const [status, setStatus] = useState('idle')
  const [versionLabel, setVersionLabel] = useState('unknown')

  const migrate = async () => {
    setStatus('migrating')
    const result = await runMigrations()
    setVersionLabel(`${result.fromVersion} -> ${result.toVersion}`)
    setStatus('done')
  }

  useEffect(() => {
    migrate()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schema Migration</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Version transition: {versionLabel}</Text>
      <Pressable style={styles.button} onPress={migrate}>
        <Text style={styles.buttonText}>Run Idempotent Migration</Text>
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
