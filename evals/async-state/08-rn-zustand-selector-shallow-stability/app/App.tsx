import { Button, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type StoreState = {
  count: number
  status: 'idle' | 'loading' | 'done'
  runAsyncAction: () => Promise<void>
}

const useStore = create<StoreState>()((set) => ({
  count: 0,
  status: 'idle',
  runAsyncAction: async () => {
    set({ status: 'loading' })
    // TODO: implement async store behavior for this eval
    set((prev) => ({ count: prev.count + 1, status: 'done' }))
  },
}))

function Screen() {
  const { count, status } = useStore(
    useShallow((state) => ({ count: state.count, status: state.status }))
  )
  const runAsyncAction = useStore((state) => state.runAsyncAction)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Zustand Starter</Text>
      <Text style={styles.subtitle}>Status: {status}</Text>
      <Text style={styles.subtitle}>Count: {count}</Text>
      <Button title='Call async action placeholder' onPress={() => void runAsyncAction()} />
    </View>
  )
}

export default function App() {
  return <Screen />
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
