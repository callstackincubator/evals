import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const handleSendTest = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>
        Notification appearance is configured at the native level.
      </Text>

      <Pressable style={styles.button} onPress={handleSendTest}>
        <Text style={styles.buttonText}>Send Test Notification</Text>
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
    textAlign: 'center',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
