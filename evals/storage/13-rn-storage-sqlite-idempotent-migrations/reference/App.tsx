import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite'

type MigrationStep = {
  sql: string[]
  version: number
}

const MIGRATIONS: MigrationStep[] = [
  {
    sql: [
      'CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY NOT NULL, body TEXT NOT NULL, updated_at INTEGER NOT NULL)',
    ],
    version: 1,
  },
  {
    sql: [
      'ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0',
    ],
    version: 2,
  },
  {
    sql: [
      'CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)',
    ],
    version: 3,
  },
]

async function ensureVersionTable(db: SQLiteDatabase) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_meta (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER NOT NULL)',
  )
  await db.execAsync('INSERT OR IGNORE INTO schema_meta (id, version) VALUES (1, 0)')
}

async function readSchemaVersion(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ version: number }>('SELECT version FROM schema_meta WHERE id = 1')
  return row?.version ?? 0
}

async function runMigrations(db: SQLiteDatabase, migrations: MigrationStep[]) {
  await ensureVersionTable(db)
  const currentVersion = await readSchemaVersion(db)

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue
    }

    await db.withTransactionAsync(async () => {
      for (const statement of migration.sql) {
        await db.execAsync(statement)
      }
      await db.runAsync('UPDATE schema_meta SET version = ? WHERE id = 1', migration.version)
    })
  }

  return readSchemaVersion(db)
}

export default function App() {
  const [version, setVersion] = useState(0)
  const [status, setStatus] = useState('idle')

  const run = async () => {
    setStatus('migrating')
    try {
      const db = await openDatabaseAsync('storage-migrations')
      const nextVersion = await runMigrations(db, MIGRATIONS)
      setVersion(nextVersion)
      setStatus('done')
    } catch (error) {
      console.error('Error occurred while running migrations', error)
      setStatus('error')
    }
  }

  useEffect(() => {
    void run()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage</Text>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Schema version: {version}</Text>
      <Pressable style={styles.button} onPress={run}>
        <Text style={styles.buttonText}>Run Idempotent Migrations</Text>
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
