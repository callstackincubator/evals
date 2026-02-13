import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { useCallback, useRef, useState } from 'react'

type Item = {
  id: string
  title: string
}

const PAGE_SIZE = 20
const TOTAL_PAGES = 5

function buildPage(page: number): Item[] {
  return Array.from({ length: PAGE_SIZE }, (_, index) => {
    const absolute = page * PAGE_SIZE + index + 1
    return {
      id: `item-${absolute}`,
      title: `Feed item ${absolute}`,
    }
  })
}

export default function App() {
  const [items, setItems] = useState<Item[]>(() => buildPage(0))
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const pageRef = useRef(0)

  const loadNextPage = useCallback(() => {
    if (loadingRef.current || pageRef.current >= TOTAL_PAGES - 1) {
      return
    }

    loadingRef.current = true
    setLoading(true)

    setTimeout(() => {
      const nextPage = pageRef.current + 1

      setItems((prev) => [...prev, ...buildPage(nextPage)])
      pageRef.current = nextPage

      loadingRef.current = false
      setLoading(false)
    }, 500)
  }, [])

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.title}</Text>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <ActivityIndicator />
              <Text style={styles.footerText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 16,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#4b5563',
    marginLeft: 8,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    color: '#111827',
    fontSize: 16,
  },
})
