import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

type Row = {
  id: string
  title: string
}

const CONTACT_ROWS: Row[] = [
  {
    id: 'c-1',
    title: 'Ada Lovelace',
  },
  {
    id: 'c-2',
    title: 'Grace Hopper',
  },
  {
    id: 'c-3',
    title: 'Margaret Hamilton',
  },
  {
    id: 'c-4',
    title: 'Katherine Johnson',
  },
]

function RowItem({ item }: { item: Row }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title}</Text>
    </View>
  )
}

function toggleSelectionAction() {
  // No-op
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selectable Contacts</Text>
      <Text style={styles.helper}>
        Contact rows are available. Browse list items.
      </Text>
      <Pressable style={styles.button} onPress={toggleSelectionAction}>
        <Text style={styles.buttonText}>Open</Text>
      </Pressable>
      <FlatList
        data={CONTACT_ROWS}
        renderItem={({ item }) => <RowItem item={item} />}
      />
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
