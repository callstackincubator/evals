import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { create } from 'zustand'

type SearchStore = {
  activeRequestId: number
  query: string
  result: string | null
  status: 'idle' | 'loading' | 'ready'
  runSearch: (nextQuery: string) => Promise<void>
  setQuery: (nextQuery: string) => void
}

const useSearchStore = create<SearchStore>((set, get) => {
  return {
    activeRequestId: 0,
    query: '',
    result: null,
    status: 'idle',
    runSearch: async (nextQuery: string) => {
      const requestId = get().activeRequestId + 1

      set({ activeRequestId: requestId, query: nextQuery, status: 'loading' })

      const networkDelay = nextQuery.includes('-slow')
        ? 700
        : nextQuery.includes('-fast')
          ? 220
          : 420
      await new Promise<void>((resolve) => {
        setTimeout(resolve, networkDelay)
      })

      if (get().activeRequestId !== requestId) {
        return
      }

      set({
        result: `Result for "${nextQuery}" returned in ${networkDelay}ms`,
        status: 'ready',
      })
    },
    setQuery: (nextQuery) => {
      set({ query: nextQuery })
    },
  }
})

export default function App() {
  const query = useSearchStore((state) => state.query)
  const result = useSearchStore((state) => state.result)
  const status = useSearchStore((state) => state.status)
  const setQuery = useSearchStore((state) => state.setQuery)
  const runSearch = useSearchStore((state) => state.runSearch)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Latest-intent wins</Text>

      <TextInput
        onChangeText={setQuery}
        placeholder='Type a query'
        placeholderTextColor='#94a3b8'
        style={styles.input}
        value={query}
      />

      <View style={styles.row}>
        <Pressable
          onPress={() => {
            runSearch(query)
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            runSearch(`${query}-slow`)
            runSearch(`${query}-fast`)
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Trigger race</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>Status: {status}</Text>
      <Text style={styles.result}>{result ?? 'No result yet'}</Text>
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
