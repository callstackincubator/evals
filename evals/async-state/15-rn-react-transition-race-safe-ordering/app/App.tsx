import { Suspense, useState, useTransition } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

async function loadResultPlaceholder(input: string) {
  // TODO: implement transition-safe async result behavior
  return `result-${input}`
}

function Content({ value }: { value: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Transition Starter</Text>
      <Text style={styles.subtitle}>Value: {value}</Text>
    </View>
  )
}

export default function App() {
  const [value, setValue] = useState('idle')
  const [isPending, startTransition] = useTransition()

  const runPlaceholder = () => {
    startTransition(() => {
      void loadResultPlaceholder('next').then((next) => setValue(next))
    })
  }

  return (
    <Suspense fallback={<Text>Loading…</Text>}>
      <View style={styles.screen}>
        <Content value={value} />
        <Button title='Run transition placeholder' onPress={runPlaceholder} />
        <Text style={styles.subtitle}>Pending: {String(isPending)}</Text>
      </View>
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
