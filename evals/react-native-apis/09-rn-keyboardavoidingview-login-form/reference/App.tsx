import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formShell}
      >
        <Text style={styles.title}>Login</Text>
        <TextInput
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  formShell: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
