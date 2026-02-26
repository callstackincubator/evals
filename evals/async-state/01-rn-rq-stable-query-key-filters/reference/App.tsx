import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  QueryFunctionContext,
  useQuery,
} from '@tanstack/react-query'

const FILTER_OPTIONS = [
  'all',
  'smartphones',
  'laptops',
] as const

type ProductFilter = typeof FILTER_OPTIONS[number]

type Product = {
  id: number
  title: string
  price: number
}

type ProductsResponse = {
  items: Product[]
  page: number
  totalPages: number
}

type ProductsQueryKey = readonly ['products', ProductFilter, number, number]

const PAGE_SIZE = 10

const queryClient = new QueryClient()

function buildProductsQueryKey(
  filter: ProductFilter,
  page: number,
  pageSize: number
): ProductsQueryKey {
  return ['products', filter, page, pageSize] as const
}

async function fetchProducts(
  filter: ProductFilter,
  page: number,
  pageSize: number,
  signal?: AbortSignal
): Promise<ProductsResponse> {
  const skip = (page - 1) * pageSize

  const endpoint =
    filter === 'all'
      ? `https://dummyjson.com/products?limit=${pageSize}&skip=${skip}`
      : `https://dummyjson.com/products/category/${encodeURIComponent(filter)}?limit=${pageSize}&skip=${skip}`

  const response = await fetch(endpoint, { signal })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const json = (await response.json()) as {
    products: Product[]
    total: number
    skip: number
    limit: number
  }

  const totalPages = Math.max(1, Math.ceil(json.total / json.limit))
  const resolvedPage = Math.floor(json.skip / json.limit) + 1

  return {
    items: json.products,
    page: resolvedPage,
    totalPages,
  }
}

function ProductsScreen() {
  const [filter, setFilter] = useState<ProductFilter>('all')
  const [page, setPage] = useState(1)

  const { data, isFetching, isLoading } = useQuery({
    placeholderData: (previous) => previous,
    queryFn: ({
      queryKey: [, activeFilter, activePage, activePageSize],
      signal,
    }: QueryFunctionContext<ProductsQueryKey>) => {
      return fetchProducts(activeFilter, activePage, activePageSize, signal)
    },
    queryKey: buildProductsQueryKey(filter, page, PAGE_SIZE),
  })

  const totalPages = data?.totalPages ?? 1

  const setNextFilter = (nextFilter: ProductFilter) => {
    setFilter(nextFilter)
    setPage(1)
  }

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
                setNextFilter(candidate)
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

      {isLoading ? <Text style={styles.meta}>Loading…</Text> : null}
      {isFetching && !isLoading ? <Text style={styles.meta}>Refreshing…</Text> : null}

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.meta}>No rows yet.</Text>}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowAmount}>${item.price}</Text>
            </View>
          )
        }}
      />

      <View style={styles.paginationRow}>
        <Pressable
          disabled={page <= 1}
          onPress={() => {
            setPage((previous) => Math.max(1, previous - 1))
          }}
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </Pressable>

        <Text style={styles.pageLabel}>
          Page {data?.page ?? page} / {totalPages}
        </Text>

        <Pressable
          disabled={page >= totalPages}
          onPress={() => {
            setPage((previous) => Math.min(totalPages, previous + 1))
          }}
          style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductsScreen />
    </QueryClientProvider>
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
