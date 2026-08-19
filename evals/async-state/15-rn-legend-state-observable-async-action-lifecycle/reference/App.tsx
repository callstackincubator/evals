import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { observable } from '@legendapp/state'
import { useValue } from '@legendapp/state/react'

type FeedStatus = 'idle' | 'loading' | 'success' | 'error'

type FeedState = {
  errorMessage: string | null
  items: string[]
  status: FeedStatus
}

const INITIAL_FEED_STATE: FeedState = {
  errorMessage: null,
  items: [],
  status: 'idle',
}

const feed$ = observable<FeedState>({ ...INITIAL_FEED_STATE })

async function fetchFeedItems(endpoint: string): Promise<string[]> {
  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    todos: Array<{ id: number; todo: string }>
  }

  return json.todos.map((item) => item.todo)
}

const fetchFeed = async () => {
  feed$.errorMessage.set(null)
  feed$.status.set('loading')

  try {
    const items = await fetchFeedItems(
      'https://dummyjson.com/todos?limit=3&skip=0'
    )
    feed$.items.set(items)
    feed$.status.set('success')
  } catch (error) {
    feed$.errorMessage.set(
      error instanceof Error ? error.message : 'Unknown error'
    )
    feed$.status.set('error')
  }
}

const resetFeed = () => {
  feed$.set({ ...INITIAL_FEED_STATE })
}

export default function App() {
  const status = useValue(feed$.status)
  const items = useValue(feed$.items)
  const errorMessage = useValue(feed$.errorMessage)

  const statusContent = {
    idle: <Text style={styles.meta}>Tap fetch to start.</Text>,
    loading: <Text style={styles.meta}>Loading feed…</Text>,
    success: items.map((item) => (
      <View key={item} style={styles.item}>
        <Text>{item}</Text>
      </View>
    )),
    error: (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Pressable onPress={() => void fetchFeed()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    ),
  } satisfies Record<FeedStatus, React.ReactNode>

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed</Text>

      <View style={styles.row}>
        <Pressable onPress={() => void fetchFeed()} style={styles.button}>
          <Text style={styles.buttonText}>Fetch feed</Text>
        </Pressable>

        <Pressable onPress={resetFeed} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>Status {status}</Text>

      {statusContent[status]}
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
  buttonSecondary: {
    backgroundColor: '#e2e8f0',
    borderColor: '#94a3b8',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonSecondaryText: {
    color: '#334155',
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    marginTop: 10,
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#334155',
    marginTop: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
