import { StyleSheet, Text, View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useState } from 'react'

type Row = {
  id: string
  value: number
}

const PAGE_SIZE = 12
const START_THRESHOLD = 0.15
const END_THRESHOLD = 0.35

function buildRows(start: number, count: number): Row[] {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return {
      id: `row-${value}`,
      value,
    }
  })
}

export default function App() {
  const [rows, setRows] = useState<Row[]>(() => buildRows(1000, PAGE_SIZE))
  const [startCursor, setStartCursor] = useState(1000)
  const [endCursor, setEndCursor] = useState(1000 + PAGE_SIZE)
  const [loadingStart, setLoadingStart] = useState(false)
  const [loadingEnd, setLoadingEnd] = useState(false)

  const loadingAnyDirection = loadingStart || loadingEnd

  const loadStart = () => {
    if (loadingAnyDirection || startCursor <= 1) {
      return
    }

    setLoadingStart(true)

    setTimeout(() => {
      const nextStart = Math.max(1, startCursor - PAGE_SIZE)
      const count = startCursor - nextStart
      const older = buildRows(nextStart, count)

      setRows((prev) => [...older, ...prev])
      setStartCursor(nextStart)
      setLoadingStart(false)
    }, 420)
  }

  const loadEnd = () => {
    if (loadingAnyDirection) {
      return
    }

    setLoadingEnd(true)

    setTimeout(() => {
      const newer = buildRows(endCursor, PAGE_SIZE)
      setRows((prev) => [...prev, ...newer])
      setEndCursor((prev) => prev + PAGE_SIZE)
      setLoadingEnd(false)
    }, 420)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {loadingStart
          ? 'Loading previous page...'
          : loadingEnd
            ? 'Loading next page...'
            : 'Idle'}
      </Text>

      <LegendList
        data={rows}
        getEstimatedItemSize={() => 54}
        keyExtractor={(item) => item.id}
        onEndReached={loadEnd}
        onEndReachedThreshold={END_THRESHOLD}
        onStartReached={loadStart}
        onStartReachedThreshold={START_THRESHOLD}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>Row {item.value}</Text>
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
  status: {
    color: '#374151',
    marginBottom: 8,
    marginHorizontal: 12,
  },
})
