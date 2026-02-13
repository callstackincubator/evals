import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { memo, useCallback, useState } from 'react'

type Item = {
  id: string
  label: string
}

const DATA: Item[] = Array.from({ length: 2000 }, (_, index) => ({
  id: `item-${index + 1}`,
  label: `Large row #${index + 1}`,
}))

type RowProps = {
  item: Item
}

const Row = memo(function Row({ item }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{item.label}</Text>
    </View>
  )
})

export default function App() {
  const [pressCount, setPressCount] = useState(0)

  const renderItem = useCallback(({ item }: { item: Item }) => {
    return <Row item={item} />
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>
        Smaller batches improve responsiveness, with slight fill-rate tradeoff.
      </Text>

      <Pressable onPress={() => setPressCount((prev) => prev + 1)} style={styles.button}>
        <Text style={styles.buttonText}>Tap responsiveness check: {pressCount}</Text>
      </Pressable>

      <FlatList
        data={DATA}
        initialNumToRender={10}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        renderItem={renderItem}
        updateCellsBatchingPeriod={32}
        windowSize={7}
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
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowText: {
    color: '#111827',
    fontSize: 15,
  },
})
