import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRef } from 'react'

type Item = {
  id: string
  label: string
}

const ROW_HEIGHT = 56
const INITIAL_INDEX = 24

const DATA: Item[] = Array.from({ length: 120 }, (_, index) => ({
  id: `row-${index}`,
  label: `Item ${index}`,
}))

export default function App() {
  const listRef = useRef<FlatList<Item>>(null)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          listRef.current?.scrollToIndex({
            animated: true,
            index: 80,
            viewPosition: 0.5,
          })
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Jump to index 80</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={DATA}
        getItemLayout={(_, index) => ({
          index,
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
        })}
        initialScrollIndex={INITIAL_INDEX}
        keyExtractor={(item) => item.id}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({
            animated: false,
            offset: ROW_HEIGHT * index,
          })

          requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({
              animated: true,
              index,
              viewPosition: 0.5,
            })
          })
        }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rowText: {
    color: '#111827',
    fontSize: 16,
  },
})
