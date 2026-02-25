import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createMMKV, useMMKVString } from 'react-native-mmkv'

enum Theme {
  System = 'system',
  Dark = 'dark',
}

const GLOBAL_STORAGE_ID = 'global.storage'
const USER_STORAGE_ID = 'user.storage'
const THEME_KEY = 'theme'
const USER_DRAFT_KEY = 'draft'

// Storage instance can be accessed through the useMKKV hook like this:
// const globalStorage = useMMKV({ id: GLOBAL_STORAGE_ID })
const globalStorage = createMMKV({ id: GLOBAL_STORAGE_ID })
const userStorage = createMMKV({ id: USER_STORAGE_ID })

export default function App() {
  const [savedTheme, setTheme] = useMMKVString(THEME_KEY, globalStorage)
  const theme = savedTheme ?? Theme.System

  const [savedDraft, setDraft] = useMMKVString(USER_DRAFT_KEY, userStorage)
  const draft = savedDraft ?? ''

  const signOut = () => userStorage.clearAll()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage</Text>
      <Text style={styles.row}>Global theme: {theme}</Text>
      <Text style={styles.row}>User draft chars: {draft.length}</Text>

      <Pressable
        style={styles.button}
        onPress={() =>
          setTheme(theme === Theme.System ? Theme.Dark : Theme.System)
        }
      >
        <Text style={styles.buttonText}>Toggle Global Theme</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => setDraft(`${draft}*`)}>
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
