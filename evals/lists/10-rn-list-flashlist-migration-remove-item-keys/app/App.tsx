import { FlashList } from '@shopify/flash-list'
import { StyleSheet, Text, View } from 'react-native'

type FeedItem = {
  id: string
  title: string
}

const FEED_ITEMS: FeedItem[] = Array.from({ length: 40 }, (_, index) => ({
  id: `feed-${index + 1}`,
  title: `Feed item ${index + 1}`,
}))

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>FlashList Scaffold</Text>
      <Text style={styles.helper}>Migrate a FlatList-style feed to FlashList and remove recycling blockers in row subtrees, including explicit key anti-patterns inside mapped nested content.</Text>
      <FlashList
        data={FEED_ITEMS}
        estimatedItemSize={58}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.title}</Text>
          </View>
        )}
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
