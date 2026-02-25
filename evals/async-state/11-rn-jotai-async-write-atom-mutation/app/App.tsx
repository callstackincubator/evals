import { Button, StyleSheet, Text, View } from 'react-native'
import { atom, useAtom } from 'jotai'

const valueAtom = atom('')
const submitAtom = atom(null, async (_get, set, next: string) => {
  // TODO: implement async write/mutation behavior
  set(valueAtom, next)
})

function Screen() {
  const [value] = useAtom(valueAtom)
  const [, submit] = useAtom(submitAtom)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Jotai Write Starter</Text>
      <Text style={styles.subtitle}>Value: {value || '(empty)'}</Text>
      <Button title='Call write placeholder' onPress={() => void submit('next')} />
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
