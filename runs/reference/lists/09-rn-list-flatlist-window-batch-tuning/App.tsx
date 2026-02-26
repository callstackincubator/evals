import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useState } from 'react'

type Item = {
  id: string
  label: string
}

const DATA: Item[] = Array.from({ length: 2000 }, (_, index) => ({
  id: `item-${index + 1}`,
  label: `Large row #${index + 1}`,
}))

const LIST_TUNING = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 8,
  updateCellsBatchingPeriod: 32,
  windowSize: 7,
} as const

const ROW_HEIGHT = 40

type RowProps = {
  item: Item
}

function Row({ item }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{item.label}</Text>
    </View>
  )
}

export default function App() {
  const [pressCount, setPressCount] = useState(0)

  const onPressCheck = () => {
    setPressCount((prev) => prev + 1)
  }

  const renderItem: ListRenderItem<Item> = ({ item }) => <Row item={item} />

  const getItemLayout = (_: unknown, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>
        Smaller batches improve responsiveness, with slight fill-rate tradeoff.
      </Text>

      <Pressable onPress={onPressCheck} style={styles.button}>
        <Text style={styles.buttonText}>
          Tap responsiveness check: {pressCount}
        </Text>
      </Pressable>

      <FlatList
        data={DATA}
        initialNumToRender={LIST_TUNING.initialNumToRender}
        getItemLayout={getItemLayout}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={LIST_TUNING.maxToRenderPerBatch}
        removeClippedSubviews
        renderItem={renderItem}
        updateCellsBatchingPeriod={LIST_TUNING.updateCellsBatchingPeriod}
        windowSize={LIST_TUNING.windowSize}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  caption: {
    color: '#374151',
    marginBottom: 8,
    marginHorizontal: 12,
    marginTop: 56,
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
    paddingHorizontal: 12,
  },
  rowText: {
    color: '#111827',
    fontSize: 15,
  },
})
