import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

type FeedRow = {
  id: string
  body: string
  tags: { id: string; label: string }[]
}

const FEED_ROWS: FeedRow[] = Array.from({ length: 12 }, (_, index) => ({
  id: `post-${index + 1}`,
  body: `Post content ${index + 1}`,
  tags: [
    { id: `tag-a-${index + 1}`, label: 'React Native' },
    { id: `tag-b-${index + 1}`, label: 'Performance' },
  ],
}))

function migrateToFlashListAction() {
  // No-op
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed Migration Scaffold</Text>
      <Text style={styles.helper}>
        Feed items are loaded. Browse list items.
      </Text>
      <Pressable style={styles.button} onPress={migrateToFlashListAction}>
        <Text style={styles.buttonText}>Open</Text>
      </Pressable>
      <FlatList
        data={FEED_ROWS}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.body}</Text>
            <View style={styles.tagRow}>
              {item.tags.map((tag) => (
                <Text key={tag.id} style={styles.tag}>
                  {tag.label}
                </Text>
              ))}
            </View>
          </View>
        )}
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
    rowGap: 6,
  },
  rowTitle: {
    color: '#111827',
    fontSize: 15,
  },
  tag: {
    color: '#1d4ed8',
    fontSize: 12,
    marginRight: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
})
