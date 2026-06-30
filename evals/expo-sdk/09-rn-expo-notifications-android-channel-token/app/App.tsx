import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [pushToken, setPushToken] = useState<string | null>(null)

  const handleRegister = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Push Notifications</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Expo push token</Text>
        <Text style={styles.cardValue} numberOfLines={2}>
          {pushToken ?? 'Not registered'}
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register for Notifications</Text>
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
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    rowGap: 6,
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  cardValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
