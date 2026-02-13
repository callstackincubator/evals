import { useDeferredValue, useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'

const DATA = Array.from({ length: 1200 }, (_, index) => {
  return `Task #${index + 1}`
})

function expensiveFilter(items: string[], query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return items.slice(0, 120)
  }

  return items
    .filter((item) => {
      for (let i = 0; i < 300; i += 1) {
        Math.sqrt(i * 7)
      }
      return item.toLowerCase().includes(normalized)
    })
    .slice(0, 120)
}

export default function App() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    return expensiveFilter(DATA, deferredQuery)
  }, [deferredQuery])

  const isStale = query !== deferredQuery

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Deferred search</Text>

      <TextInput
        onChangeText={setQuery}
        placeholder='Search tasks'
        placeholderTextColor='#94a3b8'
        style={styles.input}
        value={query}
      />

      {isStale ? <Text style={styles.stale}>Showing stale results while filtering…</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text>{item}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  stale: {
    color: '#7c2d12',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
