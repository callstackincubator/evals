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

const DELAY_DEFAULT_MS = 420
const DELAY_SLOW_MS = 700
const DELAY_FAST_MS = 220

const SUFFIX_SLOW = '-slow'
const SUFFIX_FAST = '-fast'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const resolveDelay = (query: string) => {
  if (query.includes(SUFFIX_SLOW)) return DELAY_SLOW_MS
  if (query.includes(SUFFIX_FAST)) return DELAY_FAST_MS
  return DELAY_DEFAULT_MS
}

const runSearch = async (nextQuery: string, { set, get }: StoreApi) => {
  const requestId = get().activeRequestId + 1

  set({ activeRequestId: requestId, query: nextQuery, status: 'loading' })

  const networkDelay = resolveDelay(nextQuery)
  await sleep(networkDelay)

  if (get().activeRequestId !== requestId) {
    return
  }

  set({
    result: `Result for "${nextQuery}" returned in ${networkDelay}ms`,
    status: 'ready',
  })
}

const useSearchStore = create<SearchStore>((set, get) => ({
  activeRequestId: 0,
  query: '',
  result: null,
  status: 'idle',
  runSearch: (nextQuery) => runSearch(nextQuery, { set, get }),
  setQuery: (nextQuery) => set({ query: nextQuery }),
}))

export default function App() {
  const query = useSearchStore((state) => state.query)
  const result = useSearchStore((state) => state.result)
  const status = useSearchStore((state) => state.status)
  const setQuery = useSearchStore((state) => state.setQuery)
  const runSearch = useSearchStore((state) => state.runSearch)

  const handleSearch = () => runSearch(query)

  const handleTriggerRace = () => {
    runSearch(`${query}${SUFFIX_SLOW}`)
    runSearch(`${query}${SUFFIX_FAST}`)
  }

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
        <Pressable onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>

        <Pressable onPress={handleTriggerRace} style={styles.button}>
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
