import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

type TodoItem = {
  id: string
  title: string
}

const queryClient = new QueryClient()

let itemsDb: TodoItem[] = [
  { id: 'item-1', title: 'Review release notes' },
  { id: 'item-2', title: 'Prepare QA checklist' },
]

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function fetchItems() {
  await wait(180)
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
    queryFn: fetchItems,
    queryKey: ['items'] as const,
  })

  const createItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      reactQueryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const submit = () => {
    const nextTitle = draft.trim()
    if (!nextTitle) {
      return
    }

    createItemMutation.mutate(nextTitle)
    setDraft('')
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
