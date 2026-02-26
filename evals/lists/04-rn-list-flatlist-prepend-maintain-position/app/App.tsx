import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

type Row = {
  id: string
  title: string
}

const CHAT_MESSAGES: Row[] = Array.from({ length: 16 }, (_, index) => ({
  id: 'msg-' + String(index + 1),
  title: 'Conversation message ' + String(index + 1),
}))

function RowItem({ item }: { item: Row }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title}</Text>
    </View>
  )
}

function prependOlderMessagesAction() {
  // No-op
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat Timeline</Text>
      <Text style={styles.helper}>
        Message items is available. Browse list items.
      </Text>
      <Pressable
        style={styles.button}
        onPress={prependOlderMessagesAction}
      >
        <Text style={styles.buttonText}>Open</Text>
      </Pressable>
      <FlatList
        data={CHAT_MESSAGES}
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
