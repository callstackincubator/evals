import { Pressable, StyleSheet, Text, View } from 'react-native'

const SESSION_STATE = 'signed-out'

async function isHydrationReadyAction() {
  // No-op
  return SESSION_STATE
}

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session Gate</Text>
      <Text style={styles.subtitle}>Restore session before showing account actions.</Text>
      <Pressable style={styles.button} onPress={() => isHydrationReadyAction()}>
        <Text style={styles.buttonText}>Restore Session</Text>
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
