import { memo, useCallback, useDeferredValue, useMemo, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native'

const FILTER_LIMIT = 120
const FILTER_WORK_UNITS = 300

const DATA: ReadonlyArray<string> = Array.from({ length: 1200 }, (_, index) => {
  return `Task #${index + 1}`
})

function expensiveFilter(
  items: ReadonlyArray<string>,
  query: string
): string[] {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return items.slice(0, FILTER_LIMIT)
  }

  return items
    .filter((item) => {
      for (let i = 0; i < FILTER_WORK_UNITS; i += 1) {
        Math.sqrt(i * 7)
      }
      return item.toLowerCase().includes(normalized)
    })
    .slice(0, FILTER_LIMIT)
}

function keyExtractor(item: string): string {
  return item
}

type ResultRowProps = {
  label: string
}

const ResultRow = memo(function ResultRow({ label }: ResultRowProps) {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
    </View>
  )
})

export default function App() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    return expensiveFilter(DATA, deferredQuery)
  }, [deferredQuery])

  const handleQueryChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery)
  }, [])

  const renderItem = useCallback(({ item }: ListRenderItemInfo<string>) => {
    return <ResultRow label={item} />
  }, [])

  const isStale = query !== deferredQuery

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Deferred search</Text>

      <TextInput
        onChangeText={handleQueryChange}
        placeholder="Search tasks"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={query}
      />

      {isStale ? (
        <Text style={styles.stale}>
          Showing stale results while filtering...
        </Text>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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
