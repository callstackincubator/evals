import { Pressable, StyleSheet, Text, View } from 'react-native'
import { openDatabaseAsync } from 'expo-sqlite'

async function openDatabasePlaceholder() {
  // TODO: configure SQLite and apply migration/transaction setup for this eval
  return openDatabaseAsync('eval-storage.db')
}

async function runSqlPlaceholder() {
  const db = await openDatabasePlaceholder()
  // TODO: run prepared statements / outbox / listener wiring for this eval
  return db
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>SQLite Starter</Text>
      <Pressable style={styles.button} onPress={() => void runSqlPlaceholder()}>
        <Text style={styles.buttonText}>Run SQLite placeholder</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    rowGap: 10,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
