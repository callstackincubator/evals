import { Pressable, StyleSheet, Text, View } from 'react-native'

function TodosScreen() {
  const data = []

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Todo List</Text>

      {data.map((todo) => {
        return (
          <Pressable
            key={todo.id}
            onPress={() => {}}
            style={styles.row}
          >
            <Text style={[styles.todoText, todo.done && styles.done]}>{todo.title}</Text>
          </Pressable>
        )
      })}

      <Text style={styles.error}>Toggle failed. Cache rolled back and revalidated.</Text>
    </View>
  )
}


export default function App() {
  return (
    <TodosScreen />
  )
}

const styles = StyleSheet.create({
  done: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  error: {
    color: '#b91c1c',
    marginTop: 12,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  screen: {
    backgroundColor: '#e2e8f0',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  todoText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
})
