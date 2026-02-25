import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type OutboxRow = {
  attempts: number
  id: string
  payload: string
  status: 'failed' | 'pending' | 'sent'
}

const MAX_ATTEMPTS = 3
const BATCH_SIZE = 20

let dbPromise: Promise<SQLiteDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('sqlite-outbox.db')
  }
  return dbPromise
}

async function ensureOutboxSchema(db: SQLiteDatabase) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL, next_retry_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)'
  )
}

async function enqueueMutation(payload: string) {
  const db = await getDb()
  await ensureOutboxSchema(db)

  const now = Date.now()
  await db.runAsync(
    'INSERT INTO outbox (id, payload, status, attempts, next_retry_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    `mut_${now}`,
    payload,
    'pending',
    0,
    now,
    now
  )
}

async function replayBatch() {
  const db = await getDb()
  await ensureOutboxSchema(db)

  const now = Date.now()
  const rows = await db.getAllAsync<OutboxRow>(
    'SELECT id, payload, status, attempts FROM outbox WHERE status IN (?, ?) AND attempts < ? AND next_retry_at <= ? ORDER BY updated_at ASC LIMIT ?',
    'pending',
    'failed',
    MAX_ATTEMPTS,
    now,
    BATCH_SIZE
  )

  for (const { id, attempts } of rows) {
    const sent = attempts >= 1

    await db.withExclusiveTransactionAsync(async (transaction) => {
      if (sent) {
        await transaction.runAsync(
          'UPDATE outbox SET status = ?, updated_at = ? WHERE id = ?',
          'sent',
          Date.now(),
          id
        )
      } else {
        const nextAttempts = attempts + 1
        const nextStatus: OutboxRow['status'] =
          nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending'
        const nextRetryAt = Date.now() + nextAttempts * 3_000

        await transaction.runAsync(
          'UPDATE outbox SET attempts = ?, status = ?, next_retry_at = ?, updated_at = ? WHERE id = ?',
          nextAttempts,
          nextStatus,
          nextRetryAt,
          Date.now(),
          id
        )
      }
    })
  }
}

export default function App() {
  const [counts, setCounts] = useState({ failed: 0, pending: 0, sent: 0 })

  const refresh = async () => {
    const db = await getDb()
    await ensureOutboxSchema(db)

    const rows = await db.getAllAsync<{
      count: number
      status: 'failed' | 'pending' | 'sent'
    }>('SELECT status, COUNT(*) as count FROM outbox GROUP BY status')

    const next = { failed: 0, pending: 0, sent: 0 }
    for (const { status, count } of rows) {
      next[status] = count
    }

    setCounts(next)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Outbox Replay</Text>
      <Text style={styles.row}>Pending: {counts.pending}</Text>
      <Text style={styles.row}>Sent: {counts.sent}</Text>
      <Text style={styles.row}>Failed: {counts.failed}</Text>

      <Pressable
        style={styles.button}
        onPress={async () => {
          await enqueueMutation(`payload-${Date.now()}`)
          await refresh()
        }}
      >
        <Text style={styles.buttonText}>Enqueue Mutation</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={async () => {
          await replayBatch()
          await refresh()
        }}
      >
        <Text style={styles.buttonText}>Replay Batch</Text>
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
