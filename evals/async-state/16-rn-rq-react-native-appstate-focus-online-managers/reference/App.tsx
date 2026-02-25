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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      refetchOnMount: false,
    },
  },
})

let serverVersion = 0

async function fetchInbox(): Promise<InboxPayload> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 220)
  })

  serverVersion += 1

  return {
    items: [
      `Sync check #${serverVersion}`,
      `Foreground refresh #${serverVersion}`,
      `Reconnect refresh #${serverVersion}`,
    ],
    version: serverVersion,
  }
}

function useReactQueryLifecycleBridge() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  )
  const [isOnline, setIsOnline] = useState(true)
  const lastFocus = useRef<boolean | null>(null)
  const lastOnline = useRef<boolean | null>(null)

  const addOnAppStateChangeListener = () => {
    return AppState.addEventListener('change', (nextState) => {
      setAppState(nextState)
      const focused = nextState === 'active'

      if (lastFocus.current !== focused) {
        lastFocus.current = focused
        focusManager.setFocused(focused)
      }
    })
  }

  const addOnNetInfoChangeListener = () => {
    return NetInfo.addEventListener((state) => {
      const nextOnline =
        Boolean(state.isConnected) && state.isInternetReachable !== false

      setIsOnline(nextOnline)

      if (lastOnline.current !== nextOnline) {
        lastOnline.current = nextOnline
        onlineManager.setOnline(nextOnline)
      }
    })
  }

  useEffect(() => {
    const initialFocused = AppState.currentState === 'active'
    focusManager.setFocused(initialFocused)
    lastFocus.current = initialFocused

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
      <Text style={styles.title}>Async State</Text>

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
