import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { memo, useCallback, useMemo, useState } from 'react'

type FeedItem = {
  id: string
  liked: boolean
  title: string
}

const INITIAL_ITEMS: FeedItem[] = Array.from({ length: 40 }, (_, index) => ({
  id: `post-${index + 1}`,
  liked: false,
  title: `Post #${index + 1}`,
}))

type RowProps = {
  item: FeedItem
  onToggle: (id: string) => void
}

const Row = memo(function Row({ item, onToggle }: RowProps) {
  return (
    <Pressable onPress={() => onToggle(item.id)} style={styles.row}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={[styles.badge, item.liked && styles.badgeActive]}>
        {item.liked ? 'Liked' : 'Like'}
      </Text>
    </Pressable>
  )
})

export default function App() {
  const [items, setItems] = useState<FeedItem[]>(INITIAL_ITEMS)

  const toggleLike = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          liked: !item.liked,
        }
      })
    )
  }, [])

  const renderItem = useCallback<ListRenderItem<FeedItem>>(
    ({ item }) => <Row item={item} onToggle={toggleLike} />,
    [toggleLike]
  )

  const keyExtractor = useCallback((item: FeedItem) => item.id, [])

  const likedCount = useMemo(
    () => items.filter((item) => item.liked).length,
    [items]
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Liked posts: {likedCount}</Text>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderColor: '#9ca3af',
    borderRadius: 999,
    borderWidth: 1,
    color: '#4b5563',
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    color: '#166534',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#111827',
    fontSize: 16,
  },
})
