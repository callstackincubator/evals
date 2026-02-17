import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useState } from 'react'

type Task = {
  id: string
  title: string
}

const INITIAL_TASKS: Task[] = [
  { id: 'task-1', title: 'Inbox triage' },
  { id: 'task-2', title: 'Ship release notes' },
  { id: 'task-3', title: 'Review analytics' },
  { id: 'task-4', title: 'Plan sprint' },
]

const ESTIMATED_ITEM_SIZE = 58

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)

  const insertAtTop = () => {
    setTasks((prev) => {
      const nextIdValue = prev.length + 1

      return [
        {
          id: `task-${nextIdValue}`,
          title: `Inserted task ${nextIdValue}`,
        },
        ...prev,
      ]
    })
  }

  const reverseOrder = () => {
    setTasks((prev) => [...prev].reverse())
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Pressable onPress={insertAtTop} style={styles.button}>
          <Text style={styles.buttonText}>Insert at top</Text>
        </Pressable>

        <Pressable onPress={reverseOrder} style={styles.buttonMuted}>
          <Text style={styles.buttonMutedText}>Reverse order</Text>
        </Pressable>
      </View>

      <LegendList
        data={tasks}
        getEstimatedItemSize={() => ESTIMATED_ITEM_SIZE}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.title}</Text>
            <Text style={styles.rowId}>{item.id}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonMuted: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonMutedText: {
    color: '#1f2937',
    fontWeight: '600',
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
  controls: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: 12,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowId: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 3,
  },
  rowText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
})
