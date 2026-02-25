import { SectionList, StyleSheet, Text, View } from 'react-native'

type Row = {
  id: string
  title: string
}

type RowSection = {
  data: Row[]
  title: string
}

const SECTIONS: RowSection[] = [
  {
    title: 'Today',
    data: [
      { id: 'today-1', title: 'Draft release notes' },
      { id: 'today-2', title: 'Review pull requests' },
    ],
  },
  {
    title: 'Tomorrow',
    data: [
      { id: 'tomorrow-1', title: 'Plan sprint backlog' },
      { id: 'tomorrow-2', title: 'Sync with design' },
    ],
  },
]

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Section Scaffold</Text>
      <Text style={styles.helper}>Build a SectionList with sticky section headers and stable keys for both sections and rows so reordering sections does not corrupt rendering.</Text>
      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.title}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
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
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowTitle: {
    color: '#111827',
    fontSize: 15,
  },
  sectionHeader: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    color: '#374151',
    fontWeight: '600',
  },
})
