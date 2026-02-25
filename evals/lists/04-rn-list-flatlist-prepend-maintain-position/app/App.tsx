import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

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

function runListBehaviorPlaceholder() {
  // TODO: implement list behavior required by this eval
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>List Scaffold</Text>
      <Text style={styles.helper}>Seed data is ready; implement required list behavior.</Text>
      <Pressable style={styles.button} onPress={runListBehaviorPlaceholder}>
        <Text style={styles.buttonText}>Run placeholder</Text>
      </Pressable>
      <FlatList data={ROWS} renderItem={({ item }) => <RowItem item={item} />} />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
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
