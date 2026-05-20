import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Shipment details</Text>
        <View style={styles.details}>
          <Text style={styles.copy}>
            Estimated arrival: Tomorrow, 10:00 - 12:00
          </Text>
          <Text style={styles.copy}>Carrier: Eastline Express</Text>
          <Text style={styles.copy}>Tracking: EX-329-1192</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  copy: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 6,
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  screen: {
    backgroundColor: '#eef2ff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
})
