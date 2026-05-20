import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export default function App() {
  const [query, setQuery] = useState('')

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search</Text>

      <TextInput
        onChangeText={setQuery}
        placeholder='Type a query'
        placeholderTextColor='#94a3b8'
        style={styles.input}
        value={query}
      />

      <View style={styles.row}>
        <Pressable onPress={() => {}} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#0f172a',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#334155',
    marginTop: 12,
  },
  result: {
    color: '#0f172a',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
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
