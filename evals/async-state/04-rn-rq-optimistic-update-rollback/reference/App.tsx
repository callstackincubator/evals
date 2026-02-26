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

const flipTodo = (todo: Todo, todoId: string, nextDone: boolean): Todo =>
  todo.id === todoId ? { ...todo, done: nextDone } : todo

const fetchTodos = async (signal?: AbortSignal): Promise<Todo[]> => {
  const response = await fetch('https://dummyjson.com/todos?limit=10&skip=0', {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    todos: Array<{ completed: boolean; id: number; todo: string }>
  }

  return json.todos.map((todo) => ({
    done: todo.completed,
    id: String(todo.id),
    title: todo.todo,
  }))
}

const toggleTodoOnServer = async ({
  nextDone,
  todoId,
}: {
  nextDone: boolean
  todoId: string
}) => {
  const response = await fetch(`https://dummyjson.com/todos/${todoId}`, {
    body: JSON.stringify({
      completed: nextDone,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
}

function TodosScreen() {
  const reactQueryClient = useQueryClient()

  const todosQuery = useQuery({
    queryFn: ({ signal }: QueryFunctionContext<TodosQueryKey>) =>
      fetchTodos(signal),
    queryKey: TODOS_QUERY_KEY,
  })

  const onMutate = async ({
    nextDone,
    todoId,
  }: {
    nextDone: boolean
    todoId: string
  }): Promise<ToggleContext> => {
    await reactQueryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })

    const snapshot = reactQueryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

    reactQueryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (current = []) =>
      current.map((todo) => flipTodo(todo, todoId, nextDone))
    )

    return { snapshot }
  }

  const onError = (
    _error: unknown,
    _variables: { nextDone: boolean; todoId: string },
    context: ToggleContext | undefined
  ) => {
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

  const handleTodoPressCallback = (todoId: string, nextDone: boolean) => () => {
    toggleMutation.mutate({ nextDone, todoId })
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Todo List</Text>

      {todosQuery.data?.map((todo) => {
        return (
          <Pressable
            key={todo.id}
            onPress={handleTodoPressCallback(todo.id, !todo.done)}
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
