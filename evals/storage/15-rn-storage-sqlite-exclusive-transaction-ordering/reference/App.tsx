import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite'
import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type LogRow = {
  payload: string
  sequence: number
}

let dbPromise: Promise<SQLiteDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('exclusive-transactions.db')
  }
  return dbPromise
}

async function initialize(db: SQLiteDatabase) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS ordered_writes (sequence INTEGER PRIMARY KEY NOT NULL, payload TEXT NOT NULL)'
  )
}

export default function App() {
  const [rows, setRows] = useState<LogRow[]>([])
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve())
  const sequenceRef = useRef(0)

  useEffect(() => {
    ;(async () => {
      const db = await getDb()
      await initialize(db)
      await refresh()
    })()
  }, [])

  const refresh = async () => {
    const db = await getDb()
    const next = await db.getAllAsync<LogRow>(
      'SELECT sequence, payload FROM ordered_writes ORDER BY sequence ASC'
    )
    setRows(next)
  }

  const enqueueWrite = (payload: string, shouldFail: boolean) => {
    sequenceRef.current += 1
    const nextSequence = sequenceRef.current

    writeQueueRef.current = writeQueueRef.current.then(async () => {
      const db = await getDb()

      await db.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync(
          'INSERT INTO ordered_writes (sequence, payload) VALUES (?, ?)',
          nextSequence,
          payload
        )

        if (shouldFail) {
          throw new Error('forced rollback path')
        }
      })
    })

    writeQueueRef.current = writeQueueRef.current.catch(() => {
      return
    })
  }

  const writeToDb = async (shouldFail: boolean) => {
    const payload = shouldFail
      ? `write-fail-${Date.now()}`
      : `write-${Date.now()}`
    enqueueWrite(payload, shouldFail)
    await writeQueueRef.current
    await refresh()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exclusive Write Ordering</Text>
      <Text style={styles.row}>Persisted rows: {rows.length}</Text>

      <Pressable style={styles.button} onPress={() => writeToDb(false)}>
        <Text style={styles.buttonText}>Enqueue Successful Write</Text>
      </Pressable>

      <Pressable style={styles.dangerButton} onPress={() => writeToDb(true)}>
        <Text style={styles.buttonText}>Enqueue Failing Write (Rollback)</Text>
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
  dangerButton: {
    backgroundColor: '#b33333',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
