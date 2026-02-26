import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAtom } from 'jotai'
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

export default function App() {
  const [preferences, setPreferences] = useAtom(preferencesAtom)

  const toggleTheme = () => {
    return setPreferences((previous) => ({
      ...previous,
      theme: previous.theme === 'light' ? 'dark' : 'light',
    }))
  }

  const toggleCompact = () => {
    return setPreferences((previous) => ({
      ...previous,
      compact: !previous.compact,
    }))
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Preferences</Text>
      <Text style={styles.meta}>Theme: {preferences.theme}</Text>
      <Text style={styles.meta}>Compact mode: {preferences.compact ? 'on' : 'off'}</Text>

      <Pressable onPress={toggleTheme} style={styles.button}>
        <Text style={styles.buttonText}>Toggle theme</Text>
      </Pressable>

      <Pressable onPress={toggleCompact} style={styles.button}>
        <Text style={styles.buttonText}>Toggle compact</Text>
      </Pressable>
    </View>
  )
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
