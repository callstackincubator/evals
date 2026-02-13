import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

type TextItem = {
  id: string
  text: string
  type: 'text'
}

type ImageItem = {
  caption: string
  color: string
  id: string
  type: 'image'
}

type SystemItem = {
  id: string
  message: string
  type: 'system'
}

type TimelineItem = TextItem | ImageItem | SystemItem

const DATA: TimelineItem[] = [
  { id: 'sys-1', message: 'Yesterday', type: 'system' },
  { id: 'txt-1', text: 'Morning update', type: 'text' },
  {
    caption: 'Seaside',
    color: '#bfdbfe',
    id: 'img-1',
    type: 'image',
  },
  { id: 'txt-2', text: 'Lunch summary', type: 'text' },
  { id: 'sys-2', message: 'Today', type: 'system' },
  { id: 'txt-3', text: 'Roadmap notes', type: 'text' },
]

function TimelineRow({ item }: { item: TimelineItem }) {
  if (item.type === 'system') {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>{item.message}</Text>
      </View>
    )
  }

  if (item.type === 'image') {
    return (
      <View style={styles.imageRow}>
        <View style={[styles.image, { backgroundColor: item.color }]} />
        <Text style={styles.caption}>{item.caption}</Text>
      </View>
    )
  }

  return (
    <View style={styles.textRow}>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <FlashList
        data={DATA}
        estimatedItemSize={86}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TimelineRow item={item} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  caption: {
    color: '#374151',
    marginTop: 8,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  image: {
    borderRadius: 12,
    height: 180,
    width: '100%',
  },
  imageRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  systemRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  systemText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  text: {
    color: '#111827',
    fontSize: 15,
  },
  textRow: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
})
