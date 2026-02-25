import { StyleSheet, Text, View } from 'react-native'
import { atom, useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'

const asyncValueAtom = atom(async () => {
  // TODO: implement async atom read behavior
  return 'placeholder'
})

const loadableAtom = loadable(asyncValueAtom)

function Screen() {
  const state = useAtomValue(loadableAtom)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Jotai Loadable Starter</Text>
      <Text style={styles.subtitle}>State: {state.state}</Text>
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
