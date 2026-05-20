import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

type TodoItem = {
  id: number
  title: string
}

function ItemsScreen() {
  const [draft, setDraft] = useState('')

  const data = [] as TodoItem[]

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Items</Text>

      <View style={styles.composer}>
        <TextInput
          onChangeText={setDraft}
          placeholder='New item title'
          placeholderTextColor='#94a3b8'
          style={styles.input}
          value={draft}
        />
        <Pressable onPress={() => {}} style={styles.button}>
          <Text style={styles.buttonText}>Create</Text>
        </Pressable>
      </View>

      {data.map((item) => {
        return (
          <View key={item.id} style={styles.row}>
            <Text>{item.title}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default function App() {
  return (
    <ItemsScreen />
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    color: '#0f172a',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
})
