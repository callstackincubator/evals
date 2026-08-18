import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { observable } from '@legendapp/state'
import { Show, useValue } from '@legendapp/state/react'
import { $TextInput } from '@legendapp/state/react-native'

type Profile = {
  email: string
  name: string
}

const SAVED_PROFILE: Profile = {
  email: 'ada@example.com',
  name: 'Ada Lovelace',
}

const profile$ = observable({
  draft: { ...SAVED_PROFILE },
  saved: { ...SAVED_PROFILE },
  isDirty: (): boolean => {
    const draft = profile$.draft.get()
    const saved = profile$.saved.get()

    return draft.name !== saved.name || draft.email !== saved.email
  },
})

const saveProfile = () => {
  profile$.saved.set({ ...profile$.draft.peek() })
}

export default function App() {
  const savedName = useValue(profile$.saved.name)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Edit profile</Text>
      <Text style={styles.meta}>Saved as {savedName}</Text>

      <Text style={styles.label}>Name</Text>
      <$TextInput $value={profile$.draft.name} style={styles.input} />

      <Text style={styles.label}>Email</Text>
      <$TextInput $value={profile$.draft.email} style={styles.input} />

      <Show if={profile$.isDirty}>
        {() => (
          <View style={styles.saveBar}>
            <Text style={styles.saveBarText}>Unsaved changes</Text>
            <Pressable onPress={saveProfile} style={styles.button}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        )}
      </Show>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#334155',
    fontWeight: '600',
    marginTop: 12,
  },
  meta: {
    color: '#334155',
    marginTop: 8,
  },
  saveBar: {
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
  },
  saveBarText: {
    color: '#92400e',
    fontWeight: '600',
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
