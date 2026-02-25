import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native'

type SectionRow = {
  id: string
  title: string
}

type SectionData = {
  data: SectionRow[]
  title: string
}

const CATALOG_SECTIONS: SectionData[] = [
  {
    title: 'Fruit',
    data: [
      {
        id: 'fruit-1',
        title: 'Apple',
      },
      {
        id: 'fruit-2',
        title: 'Orange',
      },
    ],
  },
  {
    title: 'Vegetables',
    data: [
      {
        id: 'veg-1',
        title: 'Carrot',
      },
      {
        id: 'veg-2',
        title: 'Spinach',
      },
    ],
  },
]

function applyFilterAction() {
  // No-op
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Catalog Sections</Text>
      <Text style={styles.helper}>
        Catalog sections are loaded. Browse list items.
      </Text>
      <Pressable style={styles.button} onPress={applyFilterAction}>
        <Text style={styles.buttonText}>Open</Text>
      </Pressable>
      <SectionList
        sections={CATALOG_SECTIONS}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
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
  },
  rowTitle: {
    color: '#111827',
    fontSize: 15,
  },
  section: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
})
