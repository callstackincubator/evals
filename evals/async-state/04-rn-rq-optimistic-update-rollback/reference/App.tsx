import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

type Todo = {
  id: string
  title: string
  done: boolean
}

type ToggleContext = {
  snapshot: Todo[] | undefined
}

const queryClient = new QueryClient()

let todosDb: Todo[] = [
  { done: false, id: 'todo-1', title: 'Document async-state evals' },
  { done: true, id: 'todo-2', title: 'Ship benchmark runner improvements' },
  { done: false, id: 'todo-3', title: 'Trim rerenders in dashboard' },
]

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function fetchTodos() {
  await wait(180)
  return [...todosDb]
}

async function toggleTodoOnServer(todoId: string) {
  await wait(240)

  if (todoId === 'todo-3') {
    throw new Error('Server rejected this toggle')
  }

  todosDb = todosDb.map((todo) => {
    if (todo.id !== todoId) {
      return todo
    }

    return { ...todo, done: !todo.done }
  })
}

function TodosScreen() {
  const reactQueryClient = useQueryClient()

  const todosQuery = useQuery({
    queryFn: fetchTodos,
    queryKey: ['todos'] as const,
  })

  const toggleMutation = useMutation({
    mutationFn: toggleTodoOnServer,
    onError: (_error, _todoId, context) => {
      if (context?.snapshot) {
        reactQueryClient.setQueryData(['todos'], context.snapshot)
      }
    },
    onMutate: async (todoId): Promise<ToggleContext> => {
      await reactQueryClient.cancelQueries({ queryKey: ['todos'] })

      const snapshot = reactQueryClient.getQueryData<Todo[]>(['todos'])

      reactQueryClient.setQueryData<Todo[]>(['todos'], (current = []) => {
        return current.map((todo) => {
          if (todo.id !== todoId) {
            return todo
          }

          return { ...todo, done: !todo.done }
        })
      })

      return { snapshot }
    },
    onSettled: () => {
      reactQueryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Optimistic Toggle</Text>

      {todosQuery.data?.map((todo) => {
        return (
          <Pressable
            key={todo.id}
            onPress={() => {
              toggleMutation.mutate(todo.id)
            }}
            style={styles.row}
          >
            <Text style={[styles.todoText, todo.done && styles.done]}>{todo.title}</Text>
          </Pressable>
        )
      })}

      {toggleMutation.error ? (
        <Text style={styles.error}>Toggle failed. Cache rolled back and revalidated.</Text>
      ) : null}
    </View>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodosScreen />
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  done: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  error: {
    color: '#b91c1c',
    marginTop: 12,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  todoText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
})
