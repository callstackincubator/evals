import { SectionList, StyleSheet, Text, TextInput, View } from 'react-native'
import { useMemo, useState } from 'react'

type Product = {
  id: string
  name: string
}

type ProductSection = {
  data: Product[]
  key: string
  title: string
}

const SOURCE_SECTIONS: ProductSection[] = [
  {
    data: [
      { id: 'fruit-1', name: 'Apple' },
      { id: 'fruit-2', name: 'Orange' },
      { id: 'fruit-3', name: 'Pear' },
    ],
    key: 'fruit',
    title: 'Fruit',
  },
  {
    data: [
      { id: 'veg-1', name: 'Carrot' },
      { id: 'veg-2', name: 'Spinach' },
      { id: 'veg-3', name: 'Broccoli' },
    ],
    key: 'vegetables',
    title: 'Vegetables',
  },
]

export default function App() {
  const [query, setQuery] = useState('')

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (normalized.length === 0) {
      return SOURCE_SECTIONS.map((section) => ({
        ...section,
        data: [...section.data],
      }))
    }

    return SOURCE_SECTIONS.map((section) => {
      const data = section.data.filter((item) =>
        item.name.toLowerCase().includes(normalized),
      )

      return {
        ...section,
        data,
      }
    }).filter((section) => section.data.length > 0)
  }, [query])

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={setQuery}
        placeholder="Filter products"
        style={styles.input}
        value={query}
      />

      <SectionList
        extraData={query}
        keyExtractor={(item) => item.id}
        sections={filteredSections}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.name}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{section.title}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items match this filter.</Text>
          </View>
        }
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
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
  },
  header: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  headerText: {
    color: '#374151',
    fontWeight: '700',
  },
  input: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowText: {
    color: '#111827',
    fontSize: 15,
  },
})
