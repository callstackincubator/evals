import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native'

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error'

type Product = {
  id: number
  title: string
}

type ProductResponse = {
  products: Product[]
}

function getEndpoint(query: string): string {
  if (!query) {
    return 'https://dummyjson.com/products?limit=20&skip=0'
  }

  return `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=20`
}

async function fetchProducts(query: string): Promise<Product[]> {
  const response = await fetch(getEndpoint(query))

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as ProductResponse
  return json.products
}

function keyExtractor(item: Product): string {
  return String(item.id)
}

export default function App() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<Product[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const normalizedQuery = deferredQuery.trim()

    setStatus('loading')
    setErrorMessage(null)

    let cancelled = false

    fetchProducts(normalizedQuery)
      .then((nextResults) => {
        if (cancelled) {
          return
        }

        setResults(nextResults)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : 'Unknown error'
        )
      })

    return () => {
      cancelled = true
    }
  }, [deferredQuery])

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery)
  }

  const renderItem = ({ item }: ListRenderItemInfo<Product>) => {
    return (
      <View style={styles.row}>
        <Text>{item.title}</Text>
      </View>
    )
  }

  const isStale = query !== deferredQuery

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search Results</Text>

      <TextInput
        onChangeText={handleQueryChange}
        placeholder="Search products"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={query}
      />

      <Text style={styles.meta}>Status: {status}</Text>
      {isStale ? (
        <Text style={styles.stale}>Showing stale results while searching…</Text>
      ) : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={keyExtractor}
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
