import { useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function buildPlaceholderQueryKey(filter: string, page: number) {
  return ['items', filter, page] as const
}

async function fetchPlaceholderItems() {
  // TODO: implement deterministic query behavior for this eval
  return [] as string[]
}

async function submitPlaceholderMutation() {
  // TODO: implement mutation behavior for this eval
  return { ok: false }
}

function Screen() {
  const [filter] = useState('all')
  const query = useQuery({
    queryFn: fetchPlaceholderItems,
    queryKey: buildPlaceholderQueryKey(filter, 1),
  })
  const mutation = useMutation({ mutationFn: submitPlaceholderMutation })

  

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>TanStack Query Starter</Text>
      <Text style={styles.subtitle}>Items: {query.data?.length ?? 0}</Text>
      <Button title='Call mutation placeholder' onPress={() => mutation.mutate()} />
    </View>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Screen />
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    rowGap: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
  },
})
