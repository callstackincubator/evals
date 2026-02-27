import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

type Preferences = {
  compact: boolean
  theme: 'light' | 'dark'
}

type RemoteProfileStatus = 'idle' | 'loading' | 'ready' | 'error'

const STORAGE_KEY = 'user-preferences'

const SAFE_DEFAULT_PREFERENCES: Preferences = {
  compact: false,
  theme: 'light',
}

const preferencesAtom = atomWithStorage<Preferences>(
  STORAGE_KEY,
  SAFE_DEFAULT_PREFERENCES,
  createJSONStorage(() => AsyncStorage)
)

const hydrationCompleteAtom = atom(false)
const profileNameAtom = atom<string | null>(null)
const profileStatusAtom = atom<RemoteProfileStatus>('idle')

const hydratePreferencesAtom = atom(null, async (_get, set) => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as Partial<Preferences>

      await set(preferencesAtom, {
        ...SAFE_DEFAULT_PREFERENCES,
        ...parsed,
      })
    } catch {
      await set(preferencesAtom, SAFE_DEFAULT_PREFERENCES)
    }
  } finally {
    set(hydrationCompleteAtom, true)
  }
})

const loadProfileAtom = atom(null, async (_get, set) => {
  set(profileStatusAtom, 'loading')

  try {
    const response = await fetch('https://dummyjson.com/users/1')

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const json = (await response.json()) as {
      firstName: string
      lastName: string
    }

    set(profileNameAtom, `${json.firstName} ${json.lastName}`)
    set(profileStatusAtom, 'ready')
  } catch {
    set(profileStatusAtom, 'error')
  }
})

function PreferencesScreen() {
  const [preferences, setPreferences] = useAtom(preferencesAtom)
  const hydrationComplete = useAtomValue(hydrationCompleteAtom)
  const profileName = useAtomValue(profileNameAtom)
  const profileStatus = useAtomValue(profileStatusAtom)
  const hydratePreferences = useSetAtom(hydratePreferencesAtom)
  const loadProfile = useSetAtom(loadProfileAtom)

  useEffect(() => {
    void hydratePreferences()
  }, [hydratePreferences])

  useEffect(() => {
    if (!hydrationComplete) {
      return
    }

    void loadProfile()
  }, [hydrationComplete, loadProfile])

  const toggleTheme = () => {
    return setPreferences(async (previous) => {
      const previousValue = await previous

      return {
        ...previous,
        theme: previousValue.theme === 'light' ? 'dark' : 'light',
      }
    })
  }

  const toggleCompact = () => {
    return setPreferences(async (previous) => {
      const previousValue = await previous

      return {
        ...previous,
        compact: !previousValue.compact,
      }
    })
  }

  if (!hydrationComplete) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Preferences</Text>
        <Text style={styles.meta}>Loading persisted preferences...</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Preferences</Text>
      <Text style={styles.meta}>Theme: {preferences.theme}</Text>
      <Text style={styles.meta}>Compact mode: {preferences.compact ? 'on' : 'off'}</Text>
      <Text style={styles.meta}>Profile status: {profileStatus}</Text>
      {profileName ? <Text style={styles.meta}>Profile: {profileName}</Text> : null}

      <Pressable onPress={toggleTheme} style={styles.button}>
        <Text style={styles.buttonText}>Toggle theme</Text>
      </Pressable>

      <Pressable onPress={toggleCompact} style={styles.button}>
        <Text style={styles.buttonText}>Toggle compact</Text>
      </Pressable>
    </View>
  )
}

export default function App() {
  return <PreferencesScreen />
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  meta: {
    color: '#334155',
    marginTop: 8,
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
