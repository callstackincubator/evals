import NetInfo from '@react-native-community/netinfo'
import { useEffect, useRef, useState } from 'react'
import {
  AppState,
  AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
  useQuery,
} from '@tanstack/react-query'

type InboxPayload = {
  items: string[]
  version: number
}

type TodoResponse = {
  todos: Array<{
    id: number
    todo: string
    completed: boolean
  }>
  total: number
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      refetchOnMount: false,
    },
  },
})

async function fetchInbox(): Promise<InboxPayload> {
  const response = await fetch('https://dummyjson.com/todos?limit=3&skip=0')

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as TodoResponse

  return {
    items: json.todos.map((item) => item.todo),
    version: json.total,
  }
}

function useReactQueryLifecycleBridge() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  )
  const [isOnline, setIsOnline] = useState(true)

  const addOnAppStateChangeListener = () => {
    return AppState.addEventListener('change', (nextState) => {
      setAppState(nextState)
      focusManager.setFocused(nextState === 'active')
    })
  }

  const addOnNetInfoChangeListener = () => {
    return NetInfo.addEventListener((state) => {
      const nextOnline = state.isConnected && state.isInternetReachable !== false
      setIsOnline(nextOnline)
      onlineManager.setOnline(nextOnline)
    })
  }

  useEffect(() => {
    focusManager.setFocused(AppState.currentState === 'active')

    const appStateSubscription = addOnAppStateChangeListener()
    const unsubscribeNetInfo = addOnNetInfoChangeListener()

    return () => {
      appStateSubscription.remove()
      unsubscribeNetInfo()
    }
  }, [])

  return { appState, isOnline }
}

const inboxQueryKeys = {
  all: ['inbox'] as const,
}

function useInboxQuery() {
  return useQuery({
    queryFn: fetchInbox,
    queryKey: inboxQueryKeys.all,
  })
}

function InboxScreen() {
  const { appState, isOnline } = useReactQueryLifecycleBridge()
  const { data, refetch, isFetching } = useInboxQuery()

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Activity Feed</Text>

      <Text style={styles.meta}>AppState: {appState}</Text>
      <Text style={styles.meta}>
        Connectivity: {isOnline ? 'online' : 'offline'}
      </Text>
      <Text style={styles.meta}>Fetching: {isFetching ? 'yes' : 'no'}</Text>

      <Pressable onPress={() => refetch()} style={styles.button}>
        <Text style={styles.buttonText}>Manual refetch</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.meta}>Server version: {data?.version ?? '-'}</Text>

        {data?.items.map((item) => {
          return (
            <Text key={item} style={styles.row}>
              • {item}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InboxScreen />
    </QueryClientProvider>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    padding: 12,
  },
  meta: {
    color: '#334155',
    marginTop: 4,
  },
  row: {
    color: '#0f172a',
    marginTop: 6,
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
