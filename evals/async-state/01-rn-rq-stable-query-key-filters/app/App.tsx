import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

const FILTER_OPTIONS = [
  'all',
  'smartphones',
  'laptops',
] as const

function TransactionsScreen() {
  const [filter, setFilter] = useState<typeof FILTER_OPTIONS[number]>('all')
  
  // Update these with real data and logic in later steps
  const page = 1
  const totalPages = 1

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Products</Text>

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((candidate) => {
          const isActive = filter === candidate
          return (
            <Pressable
              key={candidate}
              onPress={() => {
                setFilter(candidate)
              }}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive,
                ]}
              >
                {candidate}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.meta}>No rows yet.</Text>}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowAmount}>${item.amount ?? '-'}</Text>
            </View>
          )
        }}
      />

      <View style={styles.paginationRow}>
        <Pressable
          disabled={page <= 1}
          onPress={() => {}}
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </Pressable>

        <Text style={styles.pageLabel}>
          Page {page} / {totalPages}
        </Text>

        <Pressable
          disabled={page >= totalPages}
          onPress={() => {}}
          style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function App() {
  return <TransactionsScreen />
}

const styles = StyleSheet.create({
  filterButton: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterButtonText: {
    color: '#334155',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  meta: {
    color: '#64748b',
    marginBottom: 8,
  },
  pageButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pageButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageLabel: {
    color: '#0f172a',
    fontWeight: '600',
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowAmount: {
    color: '#0f172a',
    fontWeight: '700',
  },
  rowTitle: {
    color: '#334155',
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
