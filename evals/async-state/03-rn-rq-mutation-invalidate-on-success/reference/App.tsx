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
  id: number
  title: string
}

type ItemsQueryKey = readonly ['items']

const ITEMS_QUERY_KEY: ItemsQueryKey = ['items'] as const

const queryClient = new QueryClient()

async function fetchItems(signal?: AbortSignal): Promise<TodoItem[]> {
  const response = await fetch('https://dummyjson.com/todos?limit=10&skip=0', {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    todos: Array<{ id: number; todo: string }>
  }

  return json.todos.map((todo) => ({
    id: todo.id,
    title: todo.todo,
  }))
}

async function createItem(title: string): Promise<TodoItem> {
  const response = await fetch('https://dummyjson.com/todos/add', {
    body: JSON.stringify({
      completed: false,
      todo: title,
      userId: 1,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    id: number
    todo: string
  }

  return {
    id: json.id,
    title: json.todo,
  }
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
