import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

type TransactionType = 'income' | 'expense'
type TransactionFilter = 'all' | TransactionType

type Transaction = {
  id: string
  title: string
  amount: number
  type: TransactionType
}

type TransactionsResponse = {
  items: Transaction[]
  page: number
  totalPages: number
}

type TransactionsQueryKey = readonly [
  'transactions',
  TransactionFilter,
  number,
  number,
]

const PAGE_SIZE = 4

const FILTER_OPTIONS: readonly TransactionFilter[] = [
  'all',
  'income',
  'expense',
]

const DATA: Transaction[] = [
  { amount: 4200, id: 't-1', title: 'Payroll', type: 'income' },
  { amount: 140, id: 't-2', title: 'Groceries', type: 'expense' },
  { amount: 95, id: 't-3', title: 'Fuel', type: 'expense' },
  { amount: 80, id: 't-4', title: 'Dining', type: 'expense' },
  { amount: 230, id: 't-5', title: 'Freelance payout', type: 'income' },
  { amount: 60, id: 't-6', title: 'Transit card', type: 'expense' },
  { amount: 900, id: 't-7', title: 'Bonus', type: 'income' },
  { amount: 35, id: 't-8', title: 'Coffee supplies', type: 'expense' },
  { amount: 320, id: 't-9', title: 'Tax refund', type: 'income' },
  { amount: 125, id: 't-10', title: 'Utilities', type: 'expense' },
]

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

function buildTransactionsQueryKey(
  filter: TransactionFilter,
  page: number,
  pageSize: number
): TransactionsQueryKey {
  return ['transactions', filter, page, pageSize] as const
}

async function fetchTransactions(
  filter: TransactionFilter,
  page: number,
  pageSize: number,
  signal?: AbortSignal
) {
  await wait(220, signal)

  const filtered =
    filter === 'all' ? DATA : DATA.filter((item) => item.type === filter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize

  return {
    items: filtered.slice(start, start + pageSize),
    page: safePage,
    totalPages,
  } satisfies TransactionsResponse
}

const BASELINE_FILTER: TransactionFilter = 'all'
const BASELINE_PAGE = 1
const BASELINE_TOTAL_PAGES = 1

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((candidate) => {
          const isActive = candidate === BASELINE_FILTER
          return (
            <Pressable
              key={candidate}
              onPress={() => {}}
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
        keyExtractor={(item: Transaction) => item.id}
        ListEmptyComponent={<Text style={styles.meta}>No rows yet.</Text>}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowAmount}>${item.amount}</Text>
            </View>
          )
        }}
      />

      <View style={styles.paginationRow}>
        <Pressable
          onPress={() => {}}
          style={[styles.pageButton, styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </Pressable>

        <Text style={styles.pageLabel}>
          Page {BASELINE_PAGE} / {BASELINE_TOTAL_PAGES}
        </Text>

        <Pressable
          onPress={() => {}}
          style={[styles.pageButton, styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  )
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
