import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type NetworkStatus = 'idle' | 'loading'

async function searchApi(query: string): Promise<string[]> {
  const simulatedDelay = query.length % 2 === 0 ? 700 : 220

  await new Promise<void>((resolve) => {
    setTimeout(resolve, simulatedDelay)
  })

  return Array.from({ length: 5 }, (_, index) => {
    return `${query} result ${index + 1}`
  })
}

export default function App() {
  const latestRequestId = useRef(0)
  
  const [input, setInput] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('idle')
  const [isPending, startTransition] = useTransition()

  const handleInputChange = useCallback((nextInput: string) => {
    setInput(nextInput)
  }, [])
  const keyExtractor = useCallback((item: string) => item, [])
  const renderItem = useCallback<ListRenderItem<string>>(({ item }) => {
    return (
      <View style={styles.row}>
        <Text>{item}</Text>
      </View>
    )
  }, [])

  useEffect(() => {
    const nextQuery = input.trim()

    if (!nextQuery) {
      latestRequestId.current += 1
      setCommittedQuery('')
      setNetworkStatus('idle')
      setResults([])
      return
    }

    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    setNetworkStatus('loading')

    let cancelled = false

    searchApi(nextQuery)
      .then((nextResults) => {
        if (cancelled || requestId !== latestRequestId.current) {
          return
        }

        startTransition(() => {
          setCommittedQuery(nextQuery)
          setResults(nextResults)
        })
      })
      .finally(() => {
        if (!cancelled && requestId === latestRequestId.current) {
          setNetworkStatus('idle')
        }
      })

    return () => {
      cancelled = true
    }
  }, [input, startTransition])

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Live Search</Text>

      <TextInput
        onChangeText={handleInputChange}
        placeholder="Type quickly to simulate overlapping searches"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={input}
      />

      <Text style={styles.meta}>Network: {networkStatus}</Text>
      <Text style={styles.meta}>
        Transition: {isPending ? 'pending' : 'idle'}
      </Text>
      <Text style={styles.meta}>
        Committed query: {committedQuery || 'none'}
      </Text>

      <FlatList
        data={results}
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
  meta: {
    color: '#334155',
    marginBottom: 4,
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
