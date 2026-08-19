import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { observable, syncState } from '@legendapp/state'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import { useValue } from '@legendapp/state/react'
import { syncObservable } from '@legendapp/state/sync'

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

const preferences$ = observable<Preferences>({ ...SAFE_DEFAULT_PREFERENCES })

syncObservable(preferences$, {
  persist: {
    name: STORAGE_KEY,
    plugin: observablePersistAsyncStorage({ AsyncStorage }),
  },
})

const preferencesSyncState$ = syncState(preferences$)

const profile$ = observable<{
  name: string | null
  status: RemoteProfileStatus
}>({
  name: null,
  status: 'idle',
})

const loadProfile = async () => {
  profile$.status.set('loading')

  try {
    const response = await fetch('https://dummyjson.com/users/1')

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const json = (await response.json()) as {
      firstName: string
      lastName: string
    }

    profile$.name.set(`${json.firstName} ${json.lastName}`)
    profile$.status.set('ready')
  } catch {
    profile$.status.set('error')
  }
}

const toggleTheme = () => {
  preferences$.theme.set((theme) => (theme === 'light' ? 'dark' : 'light'))
}

const toggleCompact = () => {
  preferences$.compact.set((compact) => !compact)
}

export default function App() {
  const isPersistLoaded = useValue(preferencesSyncState$.isPersistLoaded)
  const preferences = useValue(preferences$)
  const profileName = useValue(profile$.name)
  const profileStatus = useValue(profile$.status)

  useEffect(() => {
    if (!isPersistLoaded) {
      return
    }

    void loadProfile()
  }, [isPersistLoaded])

  if (!isPersistLoaded) {
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
      <Text style={styles.meta}>
        Compact mode: {preferences.compact ? 'on' : 'off'}
      </Text>
      <Text style={styles.meta}>Profile status: {profileStatus}</Text>
      {profileName ? (
        <Text style={styles.meta}>Profile: {profileName}</Text>
      ) : null}

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
