import { Suspense } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { atom, useAtomValue } from 'jotai'

const asyncValueAtom = atom(async () => {
  // TODO: implement async atom read behavior
  return 'placeholder'
})

function Content() {
  const value = useAtomValue(asyncValueAtom)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Jotai Async Starter</Text>
      <Text style={styles.subtitle}>Value: {value}</Text>
    </View>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Text>Loading…</Text>}>
      <Content />
    </Suspense>
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
