import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as SQLite from 'expo-sqlite'

type Note = {
  body: string
  id: string
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('prepared-statements.db')
  }
  return dbPromise
}

async function ensureTable(db: SQLite.SQLiteDatabase) {
  await db.execAsync('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY NOT NULL, body TEXT NOT NULL)')
}

async function insertNote(body: string) {
  const db = await getDb()
  await ensureTable(db)

  const statement = await db.prepareAsync('INSERT INTO notes (id, body) VALUES ($id, $body)')
  try {
    await statement.executeAsync({
      $body: body,
      $id: `n_${Date.now()}`,
    })
  } finally {
    await statement.finalizeAsync()
  }
}

async function searchNotes(query: string): Promise<Note[]> {
  const db = await getDb()
  await ensureTable(db)

  const statement = await db.prepareAsync(
    'SELECT id, body FROM notes WHERE body LIKE $query ORDER BY id DESC LIMIT 20',
  )

  try {
    const result = await statement.executeAsync<Note>({
      $query: `%${query}%`,
    })
    return await result.getAllAsync()
  } finally {
    await statement.finalizeAsync()
  }
}

export default function App() {
  const [rows, setRows] = useState<Note[]>([])

  const refresh = async () => {
    const next = await searchNotes('note')
    setRows(next)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prepared Statements</Text>
      <Text style={styles.row}>Rows: {rows.length}</Text>

      <Pressable
        style={styles.button}
        onPress={async () => {
          await insertNote(`note ${Date.now()}`)
          await refresh()
        }}
      >
        <Text style={styles.buttonText}>Insert with Prepared Statement</Text>
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
