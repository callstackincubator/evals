import { LegendList } from '@legendapp/list'
import { StyleSheet, Text, View } from 'react-native'

type TaskItem = {
  id: string
  title: string
}

const TASK_ITEMS: TaskItem[] = Array.from({ length: 32 }, (_, index) => ({
  id: `task-${index + 1}`,
  title: `Task ${index + 1}`,
}))

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>LegendList Scaffold</Text>
      <Text style={styles.helper}>Implement LegendList with a stable keyExtractor and layout reuse-friendly data updates so reordering and incremental inserts do not corrupt item positioning.</Text>
      <LegendList
        data={TASK_ITEMS}
        getEstimatedItemSize={() => 56}
        keyExtractor={(item) => item.id}
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
})
