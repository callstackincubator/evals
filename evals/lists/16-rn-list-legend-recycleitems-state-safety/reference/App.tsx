import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useState } from 'react'

type Note = {
  details: string
  id: string
  title: string
}

const DATA: Note[] = Array.from({ length: 180 }, (_, index) => ({
  details: `Transient details for note ${index + 1}`,
  id: `note-${index + 1}`,
  title: `Note ${index + 1}`,
}))

type RowProps = {
  expanded: boolean
  item: Note
  onToggle: (id: string, expanded: boolean) => void
}

function NoteRow({ expanded, item, onToggle }: RowProps) {
  return (
    <Pressable
      onPress={() => {
        const next = !expanded
        onToggle(item.id, next)
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

  const handleToggle = (id: string, expanded: boolean) => {
    setExpandedById((prev) => ({
      ...prev,
      [id]: expanded,
    }))
  }

  return (
    <View style={styles.container}>
      <LegendList
        data={DATA}
        getEstimatedItemSize={() => 64}
        keyExtractor={(item) => item.id}
        recycleItems
        renderItem={({ item }) => (
          <NoteRow
            expanded={Boolean(expandedById[item.id])}
            item={item}
            onToggle={handleToggle}
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
