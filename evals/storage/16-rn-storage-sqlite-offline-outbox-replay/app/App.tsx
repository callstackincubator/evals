import { Pressable, StyleSheet, Text, View } from 'react-native'

const STORAGE_KEYS = ['session', 'draft', 'outbox']

async function replaySqlOutboxPlaceholder() {
  // TODO: implement persistence behavior for this eval
  return STORAGE_KEYS.length
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Storage Starter</Text>
      <Text style={styles.subtitle}>Keys: {STORAGE_KEYS.join(', ')}</Text>
      <Pressable style={styles.button} onPress={() => replaySqlOutboxPlaceholder()}>
        <Text style={styles.buttonText}>Call placeholder</Text>
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
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
