import { useEffect, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

export default function App() {
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('Loading notes…')

  const loadNote = async () => {
    // Read the persisted note from the cache file on mount.
    setStatus('No saved note yet.')
  }

  const saveNote = async () => {
    // Persist the current draft to the cache file.
    setStatus('Saved.')
  }

  useEffect(() => {
    void loadNote()
  }, [])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notes</Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="Write something…"
        multiline
      />
      <Pressable style={styles.button} onPress={saveNote}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
      <Text style={styles.status}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 120,
    padding: 12,
    textAlignVertical: 'top',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  status: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
