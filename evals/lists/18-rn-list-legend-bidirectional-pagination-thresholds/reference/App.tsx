import { StyleSheet, Text, View } from 'react-native'
import { LegendList } from '@legendapp/list'
import { useRef, useState } from 'react'

type Row = {
  id: string
  value: number
}

type LoadingPhase = 'idle' | 'loading-start' | 'loading-end'
type LoadingDirection = 'start' | 'end'

const LIST_CONFIG = {
  estimatedItemSize: 30,
  loadDelayMs: 420,
  pagination: {
    initialStartIndex: 0,
    minStartIndex: 0,
    pageSize: 24,
    thresholds: {
      endReached: 0.15,
      startReached: 0.15,
    },
  },
}

const STATUS_TEXT: Record<LoadingPhase, string> = {
  'idle': 'Idle',
  'loading-start': 'Loading previous page...',
  'loading-end': 'Loading next page...',
}

function buildRows(startIndex: number, count: number): Row[] {
  return Array.from({ length: count }, (_, index) => {
    const rowIndex = startIndex + index
    return {
      id: `row-${rowIndex}`,
      value: rowIndex + 1,
    }
  })
}

const INITIAL_ROWS = buildRows(
  LIST_CONFIG.pagination.initialStartIndex,
  LIST_CONFIG.pagination.pageSize
)

export default function App() {
  const pagination = LIST_CONFIG.pagination
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS)
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('idle')
  const loadingPhaseRef = useRef<LoadingPhase>('idle')
  const startCursorRef = useRef(pagination.initialStartIndex)
  const endCursorRef = useRef(
    pagination.initialStartIndex + pagination.pageSize
  )

  const setPhase = (phase: LoadingPhase) => {
    loadingPhaseRef.current = phase
    setLoadingPhase(phase)
  }

  const runPagedLoad = (
    direction: LoadingDirection,
    fetchPageData: () => {
      nextCursor: number
      rows: Row[]
    },
    executePageUpdate: (data: { nextCursor: number; rows: Row[] }) => void
  ) => {
    if (loadingPhaseRef.current !== 'idle') {
      return
    }

    setPhase(direction === 'start' ? 'loading-start' : 'loading-end')

    setTimeout(() => {
      const data = fetchPageData()
      executePageUpdate(data)
      setPhase('idle')
    }, LIST_CONFIG.loadDelayMs)
  }

  const loadStart = () => {
    if (startCursorRef.current <= pagination.minStartIndex) {
      return
    }

    runPagedLoad(
      'start',
      () => {
        const nextStart = Math.max(
          pagination.minStartIndex,
          startCursorRef.current - pagination.pageSize
        )
        const count = startCursorRef.current - nextStart
        const older = buildRows(nextStart, count)

        return {
          nextCursor: nextStart,
          rows: older,
        }
      },
      (data) => {
        setRows((prev) => [...data.rows, ...prev])
        startCursorRef.current = data.nextCursor
      }
    )
  }

  const loadEnd = () => {
    runPagedLoad(
      'end',
      () => {
        const newer = buildRows(endCursorRef.current, pagination.pageSize)
        const nextEndCursor = endCursorRef.current + pagination.pageSize

        return {
          nextCursor: nextEndCursor,
          rows: newer,
        }
      },
      (data) => {
        setRows((prev) => [...prev, ...data.rows])
        endCursorRef.current = data.nextCursor
      }
    )
  }

  const statusText = STATUS_TEXT[loadingPhase]

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{statusText}</Text>

      <LegendList
        data={rows}
        getEstimatedItemSize={() => LIST_CONFIG.estimatedItemSize}
        keyExtractor={(item) => item.id}
        onEndReached={loadEnd}
        onEndReachedThreshold={pagination.thresholds.endReached}
        onStartReached={loadStart}
        onStartReachedThreshold={pagination.thresholds.startReached}
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
