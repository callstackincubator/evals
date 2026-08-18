import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type Profile = {
  email: string
  name: string
}

const SAVED_PROFILE: Profile = {
  email: 'ada@example.com',
  name: 'Ada Lovelace',
}

export default function App() {
  const [name, setName] = useState(SAVED_PROFILE.name)
  const [email, setEmail] = useState(SAVED_PROFILE.email)

  const isDirty = false

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Edit profile</Text>
      <Text style={styles.meta}>Saved as {SAVED_PROFILE.name}</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput onChangeText={setName} style={styles.input} value={name} />

      <Text style={styles.label}>Email</Text>
      <TextInput onChangeText={setEmail} style={styles.input} value={email} />

      {isDirty ? (
        <View style={styles.saveBar}>
          <Text style={styles.saveBarText}>Unsaved changes</Text>
          <Pressable onPress={() => {}} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      ) : null}
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
