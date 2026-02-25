import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  QueryFunctionContext,
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

type TodosQueryKey = readonly ['todos']

const TODOS_QUERY_KEY: TodosQueryKey = ['todos'] as const

const queryClient = new QueryClient()

const todosDb: readonly Todo[] = [
  { done: false, id: 'todo-1', title: 'Document async-state evals' },
  { done: true, id: 'todo-2', title: 'Ship benchmark runner improvements' },
  { done: false, id: 'todo-3', title: 'Trim rerenders in dashboard' },
]

const toggledIds = new Set<string>()

const FETCH_DELAY_MS = 180
const TOGGLE_DELAY_MS = 240

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const resolveTodo = (todo: Todo): Todo => ({
  ...todo,
  done: toggledIds.has(todo.id) ? !todo.done : todo.done,
})

const flipTodo = (todo: Todo, todoId: string): Todo =>
  todo.id === todoId ? { ...todo, done: !todo.done } : todo

const fetchTodos = async (_signal?: AbortSignal) => {
  await sleep(FETCH_DELAY_MS)
  return todosDb.map(resolveTodo)
}

const toggleTodoOnServer = async (todoId: string) => {
  await sleep(TOGGLE_DELAY_MS)

  if (todoId === 'todo-3') {
    throw new Error('Server rejected this toggle')
  }

  if (toggledIds.has(todoId)) {
    toggledIds.delete(todoId)
  } else {
    toggledIds.add(todoId)
  }
}

function TodosScreen() {
  const reactQueryClient = useQueryClient()

  const todosQuery = useQuery({
    queryFn: ({ signal }: QueryFunctionContext<TodosQueryKey>) =>
      fetchTodos(signal),
    queryKey: TODOS_QUERY_KEY,
  })

  const onMutate = async (todoId: string): Promise<ToggleContext> => {
    await reactQueryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })

    const snapshot = reactQueryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

    reactQueryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (current = []) =>
      current.map((todo) => flipTodo(todo, todoId))
    )

    return { snapshot }
  }

  const onError = (_error: unknown, _todoId: string, context: ToggleContext | undefined) => {
    if (context?.snapshot) {
      reactQueryClient.setQueryData(TODOS_QUERY_KEY, context.snapshot)
    }
  }

  const onSettled = async () => {
    await reactQueryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
  }

  const toggleMutation = useMutation({
    mutationFn: toggleTodoOnServer,
    onError,
    onMutate,
    onSettled,
  })

  const handleTodoPressCallback = (todoId: string) => () => {
    toggleMutation.mutate(todoId)
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Async State</Text>

      {todosQuery.data?.map((todo) => {
        return (
          <Pressable
            key={todo.id}
            onPress={handleTodoPressCallback(todo.id)}
            style={styles.row}
          >
            <Text style={[styles.todoText, todo.done && styles.done]}>{todo.title}</Text>
          </Pressable>
        )
      })}

      {toggleMutation.error && (
        <Text style={styles.error}>Toggle failed. Cache rolled back and revalidated.</Text>
      )}
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
