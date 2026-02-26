import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useState } from 'react'

type Article = {
  details: string
  id: string
  title: string
}

const DATA: Article[] = Array.from({ length: 120 }, (_, index) => ({
  details: `Details for item ${index + 1}`,
  id: `article-${index + 1}`,
  title: `Headline ${index + 1}`,
}))

type RowProps = {
  expanded: boolean
  item: Article
  onExpandedChange: (id: string, expanded: boolean) => void
}

function ExpandableRow({ expanded, item, onExpandedChange }: RowProps) {
  return (
    <Pressable
      onPress={() => {
        const next = !expanded
        onExpandedChange(item.id, next)
      }}
      style={styles.row}
    >
      <Text style={styles.title}>{item.title}</Text>
      {expanded ? <Text style={styles.details}>{item.details}</Text> : null}
    </Pressable>
  )
}

export default function App() {
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({})

  const handleExpandedChange = (id: string, expanded: boolean) => {
    setExpandedById((prev) => ({
      ...prev,
      [id]: expanded,
    }))
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpandableRow
            expanded={Boolean(expandedById[item.id])}
            item={item}
            onExpandedChange={handleExpandedChange}
          />
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
  details: {
    color: '#4b5563',
    marginTop: 6,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
})
