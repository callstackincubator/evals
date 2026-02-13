import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as SQLite from 'expo-sqlite'

type Item = {
  id: number
  value: string
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('reactive-listener.db', {
      enableChangeListener: true,
    })
  }

  return dbPromise
}

async function ensureTable(db: SQLite.SQLiteDatabase) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, value TEXT NOT NULL)',
  )
}

export default function App() {
  const [items, setItems] = useState<Item[]>([])

  const refreshItems = async () => {
    const db = await getDb()
    await ensureTable(db)
    const rows = await db.getAllAsync<Item>('SELECT id, value FROM items ORDER BY id DESC')
    setItems(rows)
  }

  useEffect(() => {
    let mounted = true
    let removeListener = () => {
      return
    }

    const setup = async () => {
      const db = await getDb()
      await ensureTable(db)
      if (mounted) {
        await refreshItems()
      }

      const subscription = SQLite.addDatabaseChangeListener((event) => {
        if (event.databaseName === 'reactive-listener.db' && event.tableName === 'items') {
          refreshItems()
        }
      })

      removeListener = () => {
        subscription.remove()
      }
    }

    setup()

    return () => {
      mounted = false
      removeListener()
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Change Listener</Text>
      <Text style={styles.row}>Items: {items.length}</Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          const db = await getDb()
          await ensureTable(db)
          await db.runAsync('INSERT INTO items (value) VALUES (?)', `value-${Date.now()}`)
        }}
      >
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
