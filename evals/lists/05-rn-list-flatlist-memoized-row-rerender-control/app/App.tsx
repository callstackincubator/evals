import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

type Row = {
  id: string
  title: string
}

const POST_ROWS: Row[] = Array.from({ length: 24 }, (_, index) => ({
  id: 'post-' + String(index + 1),
  title: 'Team update ' + String(index + 1),
}))

function RowItem({ item }: { item: Row }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title}</Text>
    </View>
  )
}

function togglePostLikePlaceholder() {
  // TODO: implement list behavior for this eval
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Post Feed</Text>
      <Text style={styles.helper}>
        Post rows are seeded. Add row update performance behavior.
      </Text>
      <Pressable style={styles.button} onPress={togglePostLikePlaceholder}>
        <Text style={styles.buttonText}>Call placeholder</Text>
      </Pressable>
      <FlatList
        data={POST_ROWS}
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
