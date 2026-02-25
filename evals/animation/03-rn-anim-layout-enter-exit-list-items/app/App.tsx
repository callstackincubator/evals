import { ScrollView, StyleSheet, Text, View } from 'react-native'

const ITEMS = [
  'Audit gestures',
  'Align spring values',
  'Review frame budget',
]

export default function App() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.list}>
        {ITEMS.map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.rowText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
  screen: {
    backgroundColor: '#eef2ff',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
})
