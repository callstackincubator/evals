import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useCallback, useMemo, useState } from 'react'

type Row = {
  id: string
  title: string
}

const DATA: Row[] = Array.from({ length: 24 }, (_, index) => ({
  id: `item-${index + 1}`,
  title: `Row ${index + 1}`,
}))

export default function App() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      const selected = selectedIds.has(item.id)

      return (
        <Pressable
          onPress={() => toggleSelection(item.id)}
          style={[styles.row, selected && styles.rowSelected]}
        >
          <Text style={[styles.rowText, selected && styles.rowTextSelected]}>
            {item.title}
          </Text>
        </Pressable>
      )
    },
    [selectedIds, toggleSelection],
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Selected: {selectedCount}</Text>
      <FlatList
        data={DATA}
        extraData={selectedIds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  row: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowSelected: {
    backgroundColor: '#1e40af',
  },
  rowText: {
    color: '#111827',
    fontSize: 16,
  },
  rowTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
})
