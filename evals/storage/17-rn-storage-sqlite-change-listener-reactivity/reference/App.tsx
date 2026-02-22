import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  SQLiteDatabase,
  openDatabaseAsync,
  addDatabaseChangeListener,
  DatabaseChangeEvent as SqliteDatabaseChangeEvent,
} from 'expo-sqlite'

type DatabaseChangeEvent = Omit<SqliteDatabaseChangeEvent, 'databaseName'>

type Item = {
  id: number
  value: string
}

const DB_NAME = 'reactive-listener'

let dbPromise: Promise<SQLiteDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DB_NAME, {
      enableChangeListener: true,
    })
  }

  return dbPromise
}

async function ensureTable(db: SQLiteDatabase) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, value TEXT NOT NULL)',
  )
}

/**
 * @param dbName - Provide only if ATTACH DATABASE statement is used
 * */
function attachDbListener(
  listener: (event: DatabaseChangeEvent) => void,
  dbName?: string
) {
  return addDatabaseChangeListener((event) => {
    if (event.databaseName !== (dbName ?? 'main')) {
      return
    }
    listener(event)
  })
}

export default function App() {
  const [items, setItems] = useState<Item[]>([])

  const refreshItems = async () => {
    const db = await getDb()
    await ensureTable(db)
    const rows = await db.getAllAsync<Item>(
      'SELECT id, value FROM items ORDER BY id DESC'
    )
    setItems(rows)
  }

  const insertRow = async () => {
    const db = await getDb()
    await ensureTable(db)
    await db.runAsync(
      'INSERT INTO items (value) VALUES (?)',
      `value-${Date.now()}`
    )
  }

  useEffect(() => {
    let cancelled = false
    let subscription: ReturnType<typeof attachDbListener> | null = null

    const setup = async () => {
      const db = await getDb()
      await ensureTable(db)
      if (cancelled) {
        return
      }
      await refreshItems()

      subscription = attachDbListener(({ tableName }) => {
        if (tableName !== 'items') {
          return
        }
        refreshItems()
      })
    }

    void setup()

    return () => {
      cancelled = true
      subscription?.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Change Listener</Text>
      <Text style={styles.row}>Items: {items.length}</Text>
      <Pressable style={styles.button} onPress={insertRow}>
        <Text style={styles.buttonText}>Insert Row</Text>
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
