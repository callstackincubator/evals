import { Pressable, StyleSheet, Text, View } from 'react-native'

const ITEMS = ['alpha', 'beta', 'gamma']

async function writeAtomMutationPlaceholder() {
  // TODO: implement async/state-management behavior for this eval
  return ITEMS.length
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Async State Starter</Text>
      <Text style={styles.subtitle}>Seed items: {ITEMS.length}</Text>
      <Pressable style={styles.button} onPress={() => writeAtomMutationPlaceholder()}>
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
