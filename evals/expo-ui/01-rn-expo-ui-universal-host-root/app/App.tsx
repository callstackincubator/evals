import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>jordan@example.com</Text>
      </View>
      <Text style={styles.hint}>Manage your profile and notification settings.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    rowGap: 4,
    width: '100%',
  },
  hint: {
    color: '#6b7280',
  },
  label: {
    color: '#6b7280',
    fontSize: 13,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
  value: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
})
