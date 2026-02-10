import { useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated'

type RowItem = {
  id: string
  label: string
}

const INITIAL_ITEMS: RowItem[] = [
  { id: 'row-1', label: 'Audit gestures' },
  { id: 'row-2', label: 'Align spring values' },
  { id: 'row-3', label: 'Review frame budget' },
]

export default function App() {
  const [items, setItems] = useState<RowItem[]>(INITIAL_ITEMS)
  const nextId = useRef(4)

  return (
    <View style={styles.screen}>
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            const id = `row-${nextId.current}`
            nextId.current += 1
            setItems((current) => [{ id, label: `New task ${id}` }, ...current])
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add row</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setItems((current) => current.slice(0, -1))
          }}
          style={[styles.button, styles.removeButton]}
        >
          <Text style={styles.buttonText}>Remove row</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {items.map((item) => {
          return (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(180)}
              key={item.id}
              layout={LinearTransition.springify()}
              style={styles.row}
            >
              <Text style={styles.rowText}>{item.label}</Text>
            </Animated.View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
  },
  removeButton: {
    backgroundColor: '#b91c1c',
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
  screen: {
    backgroundColor: '#e0f2fe',
    flex: 1,
    padding: 18,
    paddingTop: 56,
  },
})
