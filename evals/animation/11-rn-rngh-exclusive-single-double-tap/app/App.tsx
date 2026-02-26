import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const DOUBLE_TAP_MAX_DELAY_MS = 260
const TAP_MAX_DURATION_MS = 220

type Outcome = 'Waiting for tap' | 'Single tap action' | 'Double tap action'

export default function App() {
  const [outcome, setOutcome] = useState<Outcome>('Waiting for tap')

  return (
    <GestureHandlerRootView style={styles.root}>
      <Text style={styles.hint}>
        Double tap wins if second tap arrives in time
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Tap target</Text>
        <Text style={styles.outcome}>{outcome}</Text>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    width: 280,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 14,
  },
  outcome: {
    color: '#dbeafe',
    fontSize: 14,
    marginTop: 10,
  },
  root: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
})
