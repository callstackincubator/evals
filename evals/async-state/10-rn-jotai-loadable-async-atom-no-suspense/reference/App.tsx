import { Atom, atom, useAtomValue, useSetAtom } from 'jotai'
import { unwrap } from 'jotai/utils'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Report = {
  id: string
  title: string
}

type Loadable<Value> =
  | {
      state: 'loading'
    }
  | {
      state: 'hasError'
      error: unknown
    }
  | {
      state: 'hasData'
      data: Awaited<Value>
    }

const refreshIndexAtom = atom(0)

const reportsAtom = atom(async (get): Promise<Report[]> => {
  const refreshIndex = get(refreshIndexAtom)

  const endpoint =
    refreshIndex % 2 === 1
      ? 'https://dummyjson.com/todos/not-found'
      : 'https://dummyjson.com/todos?limit=3&skip=0'

  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    todos: Array<{ id: number; todo: string }>
  }

  return json.todos.map((todo) => ({
    id: String(todo.id),
    title: todo.todo,
  }))
})

function loadable<Value>(anAtom: Atom<Value>): Atom<Loadable<Value>> {
  const LOADING: Loadable<Value> = { state: 'loading' }
  const unwrappedAtom = unwrap(anAtom, () => LOADING)

  return atom((get) => {
    try {
      const data = get(unwrappedAtom)

      if (data === LOADING) {
        return LOADING
      }

      return { state: 'hasData', data } as Loadable<Value>
    } catch (error) {
      return { state: 'hasError', error }
    }
  })
}

const loadableReportsAtom = loadable(reportsAtom)

export default function App() {
  const reportsState = useAtomValue(loadableReportsAtom)
  const refresh = useSetAtom(refreshIndexAtom)

  const renderContent = () => {
    if (reportsState.state === 'loading') {
      return <Text style={styles.meta}>Loading reports…</Text>
    }

    if (reportsState.state === 'hasError') {
      return (
        <Text style={styles.error}>
          {reportsState.error instanceof Error
            ? reportsState.error.message
            : 'Unknown error'}
        </Text>
      )
    }

    return reportsState.data.map((report) => (
      <View key={report.id} style={styles.item}>
        <Text>{report.title}</Text>
      </View>
    ))
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Reports</Text>

      <Pressable
        onPress={() => {
          refresh((value) => value + 1)
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Reload</Text>
      </Pressable>

      {renderContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    marginTop: 12,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#334155',
    marginTop: 12,
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
