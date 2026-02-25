import { useDeferredValue, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

function filterPlaceholder(items: string[], query: string) {
  // TODO: implement deterministic deferred filtering
  return items.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
}

const ITEMS = ['alpha', 'beta', 'gamma']

export default function App() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const visible = filterPlaceholder(ITEMS, deferredQuery)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Deferred Value Starter</Text>
      <TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder='Search' />
      <Text style={styles.subtitle}>Visible: {visible.length}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '80%',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 10,
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
