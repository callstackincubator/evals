import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type OutboxMutation = {
  attempts: number
  id: string
  payload: {
    body: string
  }
  type: 'create-note'
}

const OUTBOX_KEY = 'outbox:mutations'
const APPLIED_IDS_KEY = 'outbox:applied-ids'
const MAX_ATTEMPTS = 3

function createMutationId() {
  return `mut_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

async function readOutbox(): Promise<OutboxMutation[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeOutbox(queue: OutboxMutation[]) {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(queue))
}

async function readAppliedIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(APPLIED_IDS_KEY)
  if (!raw) {
    return new Set()
  }

  try {
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

async function writeAppliedIds(ids: Set<string>) {
  await AsyncStorage.setItem(APPLIED_IDS_KEY, JSON.stringify(Array.from(ids)))
}

async function applyRemoteMutation(mutation: OutboxMutation): Promise<void> {
  const shouldFail = mutation.attempts < 1
  if (shouldFail) {
    throw new Error('simulated transient network error')
  }
}

export default function App() {
  const [isOnline, setIsOnline] = useState(false)
  const [queueSize, setQueueSize] = useState(0)
  const [status, setStatus] = useState('idle')
  const isReplayingRef = useRef(false)

  const reloadQueueSize = async () => {
    const queue = await readOutbox()
    setQueueSize(queue.length)
  }

  const enqueueMutation = async () => {
    const queue = await readOutbox()
    queue.push({
      attempts: 0,
      id: createMutationId(),
      payload: { body: `note-${Date.now()}` },
      type: 'create-note',
    })
    await writeOutbox(queue)
    setQueueSize(queue.length)
  }

  const replayOutbox = async (manualTrigger: boolean) => {
    if (isReplayingRef.current) {
      return
    }
    if (!isOnline && !manualTrigger) {
      return
    }

    isReplayingRef.current = true
    setStatus(manualTrigger ? 'manual-sync' : 'reconnect-sync')

    try {
      const queue = await readOutbox()
      const remaining: OutboxMutation[] = []
      const appliedIds = await readAppliedIds()

      for (const mutation of queue) {
        if (appliedIds.has(mutation.id)) {
          continue
        }

        try {
          await applyRemoteMutation(mutation)
          appliedIds.add(mutation.id)
        } catch {
          const next = {
            ...mutation,
            attempts: mutation.attempts + 1,
          }
          if (next.attempts < MAX_ATTEMPTS) {
            remaining.push(next)
          }
        }
      }

      await Promise.all([writeOutbox(remaining), writeAppliedIds(appliedIds)])
      setQueueSize(remaining.length)
      setStatus('idle')
    } finally {
      isReplayingRef.current = false
    }
  }

  useEffect(() => {
    void reloadQueueSize()
  }, [])

  useEffect(() => {
    if (!isOnline) {
      return
    }

    void replayOutbox(false)
  }, [isOnline, replayOutbox])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Outbox</Text>
      <Text style={styles.row}>Online: {String(isOnline)}</Text>
      <Text style={styles.row}>Queued: {queueSize}</Text>
      <Text style={styles.row}>Status: {status}</Text>

      <Pressable style={styles.button} onPress={enqueueMutation}>
        <Text style={styles.buttonText}>Enqueue Offline Action</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => {
          setIsOnline((prev) => !prev)
        }}
      >
        <Text style={styles.buttonText}>Toggle Connectivity</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => replayOutbox(true)}>
        <Text style={styles.buttonText}>Manual Sync</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f4fd1',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f4f6fb',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: {
    color: '#222a3f',
    marginTop: 6,
  },
  title: {
    color: '#111728',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
})
