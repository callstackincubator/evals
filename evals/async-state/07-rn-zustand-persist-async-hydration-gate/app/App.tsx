import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const hasHydrated = false
  const isAuthenticated = false

  if (!hasHydrated) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Loading your session...</Text>
      </View>
    )
  }

  const card = isAuthenticated
    ? { label: 'Authenticated content visible.', button: 'Log out' }
    : { label: 'Public content visible.', button: 'Log in' }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Session</Text>

      <View style={styles.card}>
        <Text style={styles.meta}>{card.label}</Text>
        <Pressable onPress={() => {}} style={styles.button}>
          <Text style={styles.buttonText}>{card.button}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    padding: 12,
  },
  meta: {
    color: '#334155',
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
