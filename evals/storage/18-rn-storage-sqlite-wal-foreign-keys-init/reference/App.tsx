import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite'

let initializedDbPromise: Promise<SQLiteDatabase> | null = null

async function initializeDatabase() {
  const db = await openDatabaseAsync('wal-foreign-keys')

  await db.execAsync('PRAGMA journal_mode = WAL')
  await db.execAsync('PRAGMA foreign_keys = ON')

  await db.withTransactionAsync(async () => {
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL)'
    )
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id), title TEXT NOT NULL)'
    )
  })

  return db
}

function getInitializedDb() {
  if (!initializedDbPromise) {
    initializedDbPromise = initializeDatabase()
  }

  return initializedDbPromise
}

export default function App() {
  const [status, setStatus] = useState('initializing')
  const [taskCount, setTaskCount] = useState(0)

  const refresh = async () => {
    const db = await getInitializedDb()
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks')
    setTaskCount(row?.count ?? 0)
  }

  useEffect(() => {
    const boot = async () => {
      await getInitializedDb()
      setStatus('ready')
      await refresh()
    }

    void boot()
  }, [])

  const insertRelationalRow = async () => {
    const db = await getInitializedDb()
    const projectId = `p_${Date.now()}`

    await db.runAsync(
      'INSERT INTO projects (id, name) VALUES (?, ?)',
      projectId,
      'Storage'
    )
    await db.runAsync(
      'INSERT INTO tasks (id, project_id, title) VALUES (?, ?, ?)',
      `t_${Date.now()}`,
      projectId,
      'Write docs'
    )

    await refresh()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Initialization</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Tasks: {taskCount}</Text>

      <Pressable
        disabled={status !== 'ready'}
        style={styles.button}
        onPress={insertRelationalRow}
      >
        <Text style={styles.buttonText}>Insert Valid Relational Row</Text>
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
