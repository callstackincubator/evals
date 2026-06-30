import { useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

export default function App() {
  const [tracking, setTracking] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const handleToggleTracking = () => {}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Trip Tracking</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Last update</Text>
        <Text style={styles.cardValue}>{lastUpdate ?? 'No updates yet'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Track in background</Text>
        <Switch value={tracking} onValueChange={handleToggleTracking} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#111827',
    fontSize: 16,
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
