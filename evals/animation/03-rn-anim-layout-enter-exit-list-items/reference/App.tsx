/**
 * Prompt clearly states "Create a list". ScrollView is not a list. FlatList is a React Native core component that can be easily changed to LegendList or FlashList.
 * Above change introcuced ~0.8kB size increase.
 * Stable references for keyExtractor and renderItem to avoid re-creation on each render as FlatList is a PureComponent.
 * Prompt and requirements don't say anything about how new items or already existing items should be removed. We're adding at the top, removing from the bottom.
 * Two small closures per render for adding and removing items. For a small screen it's negligible, but it's an unnecessary allocation.
 * If the buttons were wrapped in React.memo, they'd re-render every time anyway because the prop reference changes.
 */
import { useCallback, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated'

type RowItem = {
  id: string
  label: string
}

const INITIAL_ITEMS: RowItem[] = [
  { id: 'row-1', label: 'Audit gestures' },
  { id: 'row-2', label: 'Align spring values' },
  { id: 'row-3', label: 'Review frame budget' },
]

const keyExtractor = (item: RowItem) => item.id

export default function App() {
  const [items, setItems] = useState<RowItem[]>(INITIAL_ITEMS)
  const nextId = useRef(INITIAL_ITEMS.length + 1)

  // Stable reference for renderItem to avoid re-creation on each render as FlatList is a PureComponent.
  // Adjust the dependency array when needed or try React Compiler.
  const renderItem = useCallback(({ item }: { item: RowItem }) => (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition}
      style={styles.row}
    >
      <Text style={styles.rowText}>{item.label}</Text>
    </Animated.View>
  ), [])

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

      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
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
