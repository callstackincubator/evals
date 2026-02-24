import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

type Preferences = {
  compact: boolean
  theme: 'light' | 'dark'
}

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

function PreferencesScreen() {
  const [preferences, setPreferences] = useAtom(preferencesAtom)
  const hydrationComplete = useAtomValue(hydrationCompleteAtom)
  const hydratePreferences = useSetAtom(hydratePreferencesAtom)

  useEffect(() => {
    void hydratePreferences()
  }, [hydratePreferences])

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
        <Text style={styles.title}>Loading preferences…</Text>
        <Text style={styles.meta}>
          Safe default: {SAFE_DEFAULT_PREFERENCES.theme} theme until rehydration
          finishes.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Preferences</Text>
      <Text style={styles.meta}>Theme: {preferences.theme}</Text>
      <Text style={styles.meta}>
        Compact mode: {preferences.compact ? 'on' : 'off'}
      </Text>

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
