import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

enum Theme {
  System = 'system',
  Dark = 'dark',
}

const GLOBAL_THEME_KEY = 'global:theme'
const USER_ID_KEY = 'user:id'
const USER_DRAFT_KEY = 'user:draft'

export default function App() {
  const [theme, setTheme] = useState<string>(Theme.System)
  const [userId, setUserId] = useState<string | null>(null)
  const [draft, setDraft] = useState<string>('')

  const isSignedIn = userId !== null

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const result = await AsyncStorage.multiGet([
          GLOBAL_THEME_KEY,
          USER_ID_KEY,
          USER_DRAFT_KEY,
        ])

        if (cancelled) {
          return
        }

        const values = Object.fromEntries(result)
        setTheme(values[GLOBAL_THEME_KEY] ?? Theme.System)
        setDraft(values[USER_DRAFT_KEY] ?? '')
        setUserId(values[USER_ID_KEY])
      } catch (e) {
        console.log('Init error: ', e)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const signOut = async () => {
    try {
      const storeKeys = await AsyncStorage.getAllKeys()
      await AsyncStorage.multiRemove(
        storeKeys.filter((key) => key.startsWith('user:'))
      )
      setUserId(null)
      setDraft('')
    } catch (e) {
      console.log('Failed to sing out: ', e)
    }
  }

  const signIn = async () => {
    try {
      const userId = Math.floor(Math.random() * 100).toString()
      await AsyncStorage.setItem(USER_ID_KEY, userId)
      setUserId(userId)
      setDraft('')
    } catch (e) {
      console.log('Failed to sign in: ', e)
    }
  }

  const changeTheme = async () => {
    try {
      const nextTheme = theme === Theme.System ? Theme.Dark : Theme.System
      await AsyncStorage.setItem(GLOBAL_THEME_KEY, nextTheme)
      setTheme(nextTheme)
    } catch (e) {
      console.log('Failed to change theme: ', e)
    }
  }

  const updateDraft = async () => {
    if (!isSignedIn) {
      return
    }

    try {
      const updatedDraft = `${draft}*`
      await AsyncStorage.setItem(USER_DRAFT_KEY, updatedDraft)
      setDraft(updatedDraft)
    } catch (e) {
      console.log('Failed to update draft: ', e)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scoped Keys</Text>
      <Text style={styles.row}>Theme (global): {theme}</Text>
      <Text style={styles.row}>Draft (user scoped): {draft || '(empty)'}</Text>
      <Text style={styles.row}>
        Session: {isSignedIn ? userId : 'signed out'}
      </Text>

      <Pressable style={styles.button} onPress={changeTheme}>
        <Text style={styles.buttonText}>Toggle Global Theme</Text>
      </Pressable>

      {isSignedIn ? (
        <>
          <Pressable style={styles.button} onPress={updateDraft}>
            <Text style={styles.buttonText}>Update User Draft</Text>
          </Pressable>

          <Pressable style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.buttonText}>Sign Out (Scoped Clear)</Text>
          </Pressable>
        </>
      ) : (
        <Pressable style={styles.signInButton} onPress={signIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      )}
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
  signInButton: {
    backgroundColor: '#25b461',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  signOutButton: {
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
