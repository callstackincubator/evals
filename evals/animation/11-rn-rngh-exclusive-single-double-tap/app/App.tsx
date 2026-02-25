import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.copy}>
        Double tap wins if second tap arrives in time
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Tap target</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 140,
    width: '100%',
  },
  cardText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  copy: {
    color: '#334155',
    fontSize: 14,
    textAlign: 'center',
  },
  screen: {
    backgroundColor: '#f0f9ff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 12,
  },
})
