import { Suspense, useRef, useState, useTransition } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Filter = 'all' | 'open' | 'done'

type ResourceEntry = {
  data?: string[]
  error?: Error
  promise?: Promise<void>
  status: 'pending' | 'success' | 'error'
}

const cache = new Map<Filter, ResourceEntry>()

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

function buildData(filter: Filter) {
  const source: Record<Filter, string[]> = {
    all: ['Fix flaky test', 'Review PR', 'Plan release', 'Update changelog'],
    done: ['Review PR', 'Update changelog'],
    open: ['Fix flaky test', 'Plan release'],
  }

  return source[filter]
}

function ensureResource(filter: Filter): ResourceEntry {
  const existing = cache.get(filter)
  if (existing) {
    return existing
  }

  const entry: ResourceEntry = {
    status: 'pending',
  }

  entry.promise = wait(filter === 'all' ? 180 : 500)
    .then(() => {
      entry.data = buildData(filter)
      entry.status = 'success'
    })
    .catch((error) => {
      entry.error = error instanceof Error ? error : new Error('Unknown error')
      entry.status = 'error'
    })

  cache.set(filter, entry)
  return entry
}

function preloadFilter(filter: Filter) {
  const entry = ensureResource(filter)
  return entry.promise ?? Promise.resolve()
}

function readFilter(filter: Filter) {
  const entry = ensureResource(filter)

  if (entry.status === 'pending') {
    throw entry.promise
  }

  if (entry.status === 'error') {
    throw entry.error
  }

  return entry.data ?? []
}

function FilterResults({ filter }: { filter: Filter }) {
  const items = readFilter(filter)

  return (
    <View style={styles.card}>
      {items.map((item) => {
        return (
          <Text key={item} style={styles.row}>
            • {item}
          </Text>
        )
      })}
    </View>
  )
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [queuedFilter, setQueuedFilter] = useState<Filter | null>(null)
  const pendingRequestId = useRef(0)
  const [isPending, startTransition] = useTransition()

  const changeFilter = (nextFilter: Filter) => {
    if (nextFilter === activeFilter || nextFilter === queuedFilter) {
      return
    }

    const requestId = pendingRequestId.current + 1
    pendingRequestId.current = requestId

    startTransition(() => {
      setQueuedFilter(nextFilter)
    })

    preloadFilter(nextFilter)
      .then(() => {
        if (pendingRequestId.current !== requestId) {
          return
        }

        startTransition(() => {
          setActiveFilter(nextFilter)
          setQueuedFilter(null)
        })
      })
      .catch(() => {
        if (pendingRequestId.current !== requestId) {
          return
        }

        startTransition(() => {
          setQueuedFilter(null)
        })
      })
  }

  const showPending = isPending || queuedFilter !== null

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Filtered Results</Text>

      <View style={styles.filterRow}>
        {(['all', 'open', 'done'] as const).map((filter) => {
          const isActive = activeFilter === filter
          return (
            <Pressable
              key={filter}
              onPress={() => {
                changeFilter(filter)
              }}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {showPending ? <Text style={styles.meta}>Updating filter in background…</Text> : null}

      <Suspense
        fallback={
          <View style={styles.card}>
            <Text>Loading list…</Text>
          </View>
        }
      >
        <FilterResults filter={activeFilter} />
      </Suspense>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    padding: 14,
  },
  filterButton: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterButtonText: {
    color: '#334155',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  meta: {
    color: '#334155',
    marginTop: 10,
  },
  row: {
    color: '#0f172a',
    marginBottom: 6,
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
