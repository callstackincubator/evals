import { Pressable, StyleSheet, Text, View } from 'react-native'

type PermissionStatus = 'undetermined' | 'granted' | 'denied'

export default function App() {
  const permissionStatus: PermissionStatus = 'undetermined'
  const preciseAccuracy = false

  const handleRefresh = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Location Status</Text>

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission</Text>
          <Text style={styles.statusValue}>{permissionStatus}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Accuracy</Text>
          <Text style={styles.statusValue}>
            {preciseAccuracy ? 'Precise' : 'Approximate'}
          </Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleRefresh}>
        <Text style={styles.buttonText}>Refresh Status</Text>
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
    rowGap: 12,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 16,
  },
  statusLabel: {
    color: '#6b7280',
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
})
