import { Pressable, StyleSheet, Text, View } from 'react-native'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { loadable } from 'jotai/utils'

type Report = {
  id: string
  title: string
}

const refreshIndexAtom = atom(0)

const reportsAtom = atom(async (get): Promise<Report[]> => {
  const refreshIndex = get(refreshIndexAtom)

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 260)
  })

  if (refreshIndex % 2 === 1) {
    throw new Error('Failed to load reports on odd refresh attempts')
  }

  return [
    { id: 'r-1', title: 'Build health summary' },
    { id: 'r-2', title: 'Crash-free session trend' },
    { id: 'r-3', title: 'Release checklist status' },
  ]
})

const loadableReportsAtom = loadable(reportsAtom)

function ReportsScreen() {
  const reportsState = useAtomValue(loadableReportsAtom)
  const refresh = useSetAtom(refreshIndexAtom)

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Reports</Text>

      <Pressable
        onPress={() => {
          refresh((value) => value + 1)
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Reload</Text>
      </Pressable>

      {reportsState.state === 'loading' ? (
        <Text style={styles.meta}>Loading reports…</Text>
      ) : null}

      {reportsState.state === 'hasData'
        ? reportsState.data.map((report) => {
            return (
              <View key={report.id} style={styles.item}>
                <Text>{report.title}</Text>
              </View>
            )
          })
        : null}

      {reportsState.state === 'hasError' ? (
        <Text style={styles.error}>
          {reportsState.error instanceof Error
            ? reportsState.error.message
            : 'Unknown error'}
        </Text>
      ) : null}
    </View>
  )
}

export default function App() {
  return <ReportsScreen />
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    marginTop: 12,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  meta: {
    color: '#334155',
    marginTop: 12,
  },
  screen: {
    backgroundColor: '#f1f5f9',
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
})
