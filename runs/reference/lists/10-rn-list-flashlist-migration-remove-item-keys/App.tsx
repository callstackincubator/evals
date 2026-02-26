import { StyleSheet, Text, View } from 'react-native'
import { FlashList, useMappingHelper } from '@shopify/flash-list'

type FeedItem = {
  body: string
  id: string
  tags: { id: string; label: string }[]
}

const DATA: FeedItem[] = Array.from({ length: 30 }, (_, index) => ({
  body: `Post content ${index + 1}`,
  id: `post-${index + 1}`,
  tags: [
    { id: `tag-a-${index + 1}`, label: 'React Native' },
    { id: `tag-b-${index + 1}`, label: 'Performance' },
  ],
}))

function TagPill({ label }: { label: string }) {
  return (
    <View style={styles.tagPill}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

function FeedRow({ item }: { item: FeedItem }) {
  const { getMappingKey } = useMappingHelper()

  return (
    <View style={styles.row}>
      <Text style={styles.body}>{item.body}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((tag, index) => (
          <TagPill key={getMappingKey(tag.id, index)} label={tag.label} />
        ))}
      </View>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <FlashList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedRow item={item} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    color: '#111827',
    fontSize: 15,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tagPill: {
    backgroundColor: '#e0e7ff',
    borderRadius: 999,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tagText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '600',
  },
})
