import { Pressable, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'

type FeedStatus = 'idle' | 'loading' | 'success' | 'error'

type FeedStore = {
  errorMessage: string | null
  items: string[]
  status: FeedStatus
  fetchFeed: () => Promise<void>
  reset: () => void
}

let fetchAttempt = 0

const useFeedStore = create<FeedStore>((set) => {
  return {
    errorMessage: null,
    items: [],
    status: 'idle',
    fetchFeed: async () => {
      set({ errorMessage: null, status: 'loading' })

      try {
        fetchAttempt += 1

        await new Promise<void>((resolve) => {
          setTimeout(resolve, 260)
        })

        const shouldFail = fetchAttempt === 1
        if (shouldFail) {
          throw new Error('Temporary feed error (first attempt fails by design)')
        }

        set({
          items: ['Release notes', 'Crash analytics', 'Regression triage'],
          status: 'success',
        })
      } catch (error) {
        set({
          errorMessage:
            error instanceof Error ? error.message : 'Unknown feed error',
          status: 'error',
        })
      }
    },
    reset: () => {
      set({ errorMessage: null, items: [], status: 'idle' })
    },
  }
})

export default function App() {
  const status = useFeedStore((state) => state.status)
  const items = useFeedStore((state) => state.items)
  const errorMessage = useFeedStore((state) => state.errorMessage)
  const fetchFeed = useFeedStore((state) => state.fetchFeed)
  const reset = useFeedStore((state) => state.reset)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Feed lifecycle</Text>

      <View style={styles.row}>
        <Pressable onPress={fetchFeed} style={styles.button}>
          <Text style={styles.buttonText}>Fetch feed</Text>
        </Pressable>

        <Pressable onPress={reset} style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>Status: {status}</Text>

      {status === 'idle' ? <Text style={styles.meta}>Tap fetch to start.</Text> : null}
      {status === 'loading' ? <Text style={styles.meta}>Loading feed…</Text> : null}

      {status === 'success'
        ? items.map((item) => {
            return (
              <View key={item} style={styles.item}>
                <Text>{item}</Text>
              </View>
            )
          })
        : null}

      {status === 'error' ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable onPress={fetchFeed} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
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
