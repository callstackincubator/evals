import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native'
import { useMemo, useRef, useState } from 'react'

type Topic = {
  id: string
  title: string
}

type TopicSection = {
  data: Topic[]
  key: string
  title: string
}

const HEADER_HEIGHT = 36
const ROW_HEIGHT = 52

const SECTIONS: TopicSection[] = [
  {
    data: [
      { id: 'js-1', title: 'Closures' },
      { id: 'js-2', title: 'Event loop' },
      { id: 'js-3', title: 'Memory model' },
    ],
    key: 'javascript',
    title: 'JavaScript',
  },
  {
    data: [
      { id: 'rn-1', title: 'Bridge' },
      { id: 'rn-2', title: 'Fabric' },
      { id: 'rn-3', title: 'TurboModules' },
    ],
    key: 'react-native',
    title: 'React Native',
  },
  {
    data: [
      { id: 'perf-1', title: 'List virtualization' },
      { id: 'perf-2', title: 'Memoization' },
      { id: 'perf-3', title: 'Frame budgeting' },
    ],
    key: 'performance',
    title: 'Performance',
  },
]

export default function App() {
  const sectionListRef = useRef<SectionList<Topic>>(null)
  const [status, setStatus] = useState('Ready')

  const sectionIndexByTitle = useMemo(() => {
    return new Map(SECTIONS.map((section, index) => [section.title, index]))
  }, [])

  const jumpTo = (sectionTitle: string, itemIndex: number) => {
    const sectionIndex = sectionIndexByTitle.get(sectionTitle)

    if (sectionIndex == null || itemIndex < 0 || itemIndex >= SECTIONS[sectionIndex].data.length) {
      setStatus('Invalid jump target')
      return
    }

    setStatus(`Jumped to ${sectionTitle} #${itemIndex + 1}`)
    sectionListRef.current?.scrollToLocation({
      animated: true,
      itemIndex,
      sectionIndex,
      viewOffset: HEADER_HEIGHT,
      viewPosition: 0,
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Pressable onPress={() => jumpTo('React Native', 1)} style={styles.button}>
          <Text style={styles.buttonText}>Jump to React Native #2</Text>
        </Pressable>
        <Pressable onPress={() => jumpTo('Unknown', 0)} style={styles.buttonMuted}>
          <Text style={styles.buttonMutedText}>Try invalid jump</Text>
        </Pressable>
      </View>

      <Text style={styles.status}>{status}</Text>

      <SectionList
        ref={sectionListRef}
        keyExtractor={(item) => item.id}
        sections={SECTIONS}
        stickySectionHeadersEnabled
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.title}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{section.title}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonMuted: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonMutedText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 56,
  },
  controls: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  header: {
    backgroundColor: '#f3f4f6',
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerText: {
    color: '#111827',
    fontWeight: '700',
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  rowText: {
    color: '#111827',
  },
  status: {
    color: '#374151',
    marginHorizontal: 12,
    marginVertical: 10,
  },
})
