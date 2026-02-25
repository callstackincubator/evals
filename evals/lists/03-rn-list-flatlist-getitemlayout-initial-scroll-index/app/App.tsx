import { FlatList, StyleSheet, Text, View } from 'react-native'

type Row = {
  id: string
  title: string
}

const ROWS: Row[] = Array.from({ length: 30 }, (_, index) => ({
  id: `item-${index + 1}`,
  title: `Row ${index + 1}`,
}))

function RowItem({ item }: { item: Row }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title}</Text>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>List Scaffold</Text>
      <Text style={styles.helper}>Create a FlatList that opens at a non-zero initialScrollIndex and supports deterministic scrollToIndex behavior for fixed-height rows.</Text>
      <FlatList
        data={ROWS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RowItem item={item} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  header: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  helper: {
    color: '#6b7280',
    marginBottom: 10,
    marginHorizontal: 12,
    marginTop: 6,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowTitle: {
    color: '#111827',
    fontSize: 15,
  },
})
