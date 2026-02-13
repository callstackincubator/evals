import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'

type Contact = {
  id: string
  name: string
}

type ContactSection = {
  data: Contact[]
  id: string
  title: string
}

const BASE_SECTIONS: ContactSection[] = [
  {
    data: [
      { id: 'a-1', name: 'Ada Lovelace' },
      { id: 'a-2', name: 'Alan Turing' },
    ],
    id: 'favorites',
    title: 'Favorites',
  },
  {
    data: [
      { id: 'b-1', name: 'Grace Hopper' },
      { id: 'b-2', name: 'Margaret Hamilton' },
    ],
    id: 'engineering',
    title: 'Engineering',
  },
  {
    data: [
      { id: 'c-1', name: 'Katherine Johnson' },
      { id: 'c-2', name: 'Radia Perlman' },
    ],
    id: 'science',
    title: 'Science',
  },
]

export default function App() {
  const [sections, setSections] = useState<ContactSection[]>(BASE_SECTIONS)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setSections((prev) => [...prev].reverse())}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Reverse section order</Text>
      </Pressable>

      <SectionList
        keyExtractor={(item) => item.id}
        sections={sections}
        stickySectionHeadersEnabled
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.name}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{section.title}</Text>
            <Text style={styles.subtleId}>{section.id}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 12,
    marginTop: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    backgroundColor: '#f3f4f6',
    borderBottomColor: '#d1d5db',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowText: {
    color: '#111827',
    fontSize: 15,
  },
  subtleId: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
})
