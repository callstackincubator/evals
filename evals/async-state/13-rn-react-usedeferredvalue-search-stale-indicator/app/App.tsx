import { useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

export default function App() {
  const [query, setQuery] = useState('')

  const renderItem = () => {
    return (
      <View style={styles.row}></View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search Results</Text>

      <TextInput
        onChangeText={setQuery}
        placeholder="Search products"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={query}
      />

      <FlatList
        data={[]}
        renderItem={renderItem}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  error: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#334155',
    marginBottom: 8,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
