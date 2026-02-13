import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MMKV } from 'react-native-mmkv'

const globalStorage = new MMKV({ id: 'global-preferences' })
const userStorage = new MMKV({ id: 'user-session-data' })

const GLOBAL_THEME_KEY = 'theme'
const USER_DRAFT_KEY = 'draft'

export default function App() {
  const [theme, setTheme] = useState(globalStorage.getString(GLOBAL_THEME_KEY) ?? 'system')
  const [draft, setDraft] = useState(userStorage.getString(USER_DRAFT_KEY) ?? '')

  const saveGlobalTheme = (nextTheme: string) => {
    globalStorage.set(GLOBAL_THEME_KEY, nextTheme)
    setTheme(nextTheme)
  }

  const saveUserDraft = (nextDraft: string) => {
    userStorage.set(USER_DRAFT_KEY, nextDraft)
    setDraft(nextDraft)
  }

  const signOut = () => {
    userStorage.clearAll()
    setDraft('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MMKV Scoped Instances</Text>
      <Text style={styles.row}>Global theme: {theme}</Text>
      <Text style={styles.row}>User draft chars: {draft.length}</Text>

      <Pressable
        style={styles.button}
        onPress={() => saveGlobalTheme(theme === 'system' ? 'dark' : 'system')}
      >
        <Text style={styles.buttonText}>Toggle Global Theme</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => saveUserDraft(`${draft}*`)}>
        <Text style={styles.buttonText}>Append User Draft</Text>
      </Pressable>

      <Pressable style={styles.dangerButton} onPress={signOut}>
        <Text style={styles.buttonText}>Sign Out (User Reset Only)</Text>
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
