import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

export default function App() {
  const [query, setQuery] = useState('')

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Type to filter"
        autoCapitalize="none"
        style={styles.input}
      />
      <Text style={styles.preview}>Start typing above</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  preview: {
    color: '#6b7280',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
