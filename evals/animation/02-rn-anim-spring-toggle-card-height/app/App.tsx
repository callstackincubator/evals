import { ScrollView, StyleSheet, Text, View } from 'react-native'

type DetailRow = {
  label: string
  value: string
}

const CARD_TITLE = 'Shipment details'

const SHIPMENT_DETAILS: DetailRow[] = [
  { label: 'Estimated arrival', value: 'Tomorrow, 10:00 - 12:00' },
  { label: 'Carrier', value: 'Eastline Express' },
  { label: 'Tracking', value: 'EX-329-1192' },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{CARD_TITLE}</Text>
        <ScrollView style={styles.details}>
          {SHIPMENT_DETAILS.map((row) => (
            <Text key={row.label} style={styles.copy}>
              {row.label}: {row.value}
            </Text>
          ))}
        </ScrollView>
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
