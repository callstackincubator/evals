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

type StoreApi = {
  set: (partial: Partial<SearchStore>) => void
  get: () => SearchStore
}

async function fetchSearchResults(query: string): Promise<string[]> {
  const response = await fetch(
    `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=3`
  )

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    products: Array<{ title: string }>
  }

  return json.products.map((item) => item.title)
}

const runSearch = async (nextQuery: string, { set, get }: StoreApi) => {
  const requestId = get().activeRequestId + 1

  set({ activeRequestId: requestId, query: nextQuery, status: 'loading' })

  let titles: string[] = []

  try {
    titles = await fetchSearchResults(nextQuery)
  } catch {
    titles = []
  }

  if (get().activeRequestId !== requestId) {
    return
  }

  set({
    result: titles.length > 0 ? titles.join(' • ') : `No results for ${nextQuery}`,
    status: 'ready',
  })
}

const useSearchStore = create<SearchStore>((set, get) => ({
  activeRequestId: 0,
  query: '',
  result: null,
  status: 'idle',
  runSearch: (nextQuery) => runSearch(nextQuery, { get, set }),
  setQuery: (nextQuery) => set({ query: nextQuery }),
}))

export default function App() {
  const query = useSearchStore((state) => state.query)
  const result = useSearchStore((state) => state.result)
  const status = useSearchStore((state) => state.status)
  const setQuery = useSearchStore((state) => state.setQuery)
  const runSearch = useSearchStore((state) => state.runSearch)

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
        <Pressable onPress={() => runSearch(query)} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>Status {status}</Text>
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
