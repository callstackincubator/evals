import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const GLOBAL_THEME_KEY = 'global:theme'
const GLOBAL_LOCALE_KEY = 'global:locale'

function userDraftKey(userId: string) {
  return `user:${userId}:draft`
}

function userProfileKey(userId: string) {
  return `user:${userId}:profile`
}

function getUserScopedKeys(userId: string) {
  return [userDraftKey(userId), userProfileKey(userId)]
}

export default function App() {
  const [userId, setUserId] = useState('u_42')
  const [theme, setTheme] = useState('system')
  const [draft, setDraft] = useState('')

  const isSignedIn = useMemo(() => userId.length > 0, [userId])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      const keys = [GLOBAL_THEME_KEY, GLOBAL_LOCALE_KEY, userDraftKey('u_42')]
      const result = await AsyncStorage.multiGet(keys)
      if (cancelled) {
        return
      }

      const values = Object.fromEntries(result)
      setTheme(values[GLOBAL_THEME_KEY] ?? 'system')
      setDraft(values[userDraftKey('u_42')] ?? '')
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const signOut = async () => {
    if (!isSignedIn) {
      return
    }

    await AsyncStorage.multiRemove(getUserScopedKeys(userId))
    setUserId('')
    setDraft('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Namespaced Keys</Text>
      <Text style={styles.row}>Theme (global): {theme}</Text>
      <Text style={styles.row}>Draft (user scoped): {draft || '(empty)'}</Text>
      <Text style={styles.row}>Session: {isSignedIn ? userId : 'signed out'}</Text>

      <Pressable
        style={styles.button}
        onPress={async () => {
          const next = theme === 'system' ? 'dark' : 'system'
          setTheme(next)
          await AsyncStorage.multiSet([
            [GLOBAL_THEME_KEY, next],
            [GLOBAL_LOCALE_KEY, 'en-US'],
          ])
        }}
      >
        <Text style={styles.buttonText}>Toggle Global Theme</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={async () => {
          if (!isSignedIn) {
            return
          }

          const next = `${draft}*`
          setDraft(next)
          await AsyncStorage.multiSet([
            [userDraftKey(userId), next],
            [userProfileKey(userId), JSON.stringify({ userId })],
          ])
        }}
      >
        <Text style={styles.buttonText}>Update User Draft</Text>
      </Pressable>

      <Pressable style={styles.dangerButton} onPress={signOut}>
        <Text style={styles.buttonText}>Sign Out (Scoped Clear)</Text>
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
  dangerButton: {
    backgroundColor: '#b33333',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    color: '#2b324b',
    marginTop: 6,
  },
  title: {
    color: '#111728',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
})
