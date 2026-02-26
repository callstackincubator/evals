import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

type TodoItem = {
  id: string
  title: string
}

type ItemsQueryKey = readonly ['items']

const ITEMS_QUERY_KEY: ItemsQueryKey = ['items'] as const

const queryClient = new QueryClient()

let itemsDb: TodoItem[] = [
  { id: 'item-1', title: 'Review release notes' },
  { id: 'item-2', title: 'Prepare QA checklist' },
]

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

async function fetchItems(signal?: AbortSignal) {
  await wait(180, signal)
  return [...itemsDb]
}

async function createItem(title: string) {
  await wait(220)
  const next = { id: `item-${Date.now()}`, title }
  itemsDb = [next, ...itemsDb]
  return next
}

function ItemsScreen() {
  const [draft, setDraft] = useState('')
  const reactQueryClient = useQueryClient()

  const itemsQuery = useQuery({
    queryFn: ({ signal }: QueryFunctionContext<ItemsQueryKey>) =>
      fetchItems(signal),
    queryKey: ITEMS_QUERY_KEY,
  })

  const createItemMutation = useMutation({
    mutationFn: createItem,
    onError: () => {
      setDraft(draft)
    },
    onSuccess: async () => {
      await reactQueryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY })
    },
  })

  const submit = () => {
    const nextTitle = draft.trim()
    
    if (!nextTitle) {
      return
    }

    setDraft('')
    createItemMutation.mutate(nextTitle)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Items</Text>

      <View style={styles.composer}>
        <TextInput
          onChangeText={setDraft}
          placeholder='New item title'
          placeholderTextColor='#94a3b8'
          style={styles.input}
          value={draft}
        />
        <Pressable
          disabled={createItemMutation.isPending}
          onPress={submit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Create</Text>
        </Pressable>
      </View>

      {itemsQuery.isLoading ? <Text>Loading items…</Text> : null}

      {itemsQuery.data?.map((item) => {
        return (
          <View key={item.id} style={styles.row}>
            <Text>{item.title}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ItemsScreen />
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#0f172a',
    flex: 1,
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
    backgroundColor: '#e2e8f0',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
