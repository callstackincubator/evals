import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native'
import { memo, useCallback, useState } from 'react'

type Contact = {
  id: string
  name: string
}

type ContactSection = {
  data: Contact[]
  id: string
  key: string
  title: string
}

type ContactRowProps = {
  name: string
}

type ContactHeaderProps = {
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
    key: 'favorites',
    title: 'Favorites',
  },
  {
    data: [
      { id: 'b-1', name: 'Grace Hopper' },
      { id: 'b-2', name: 'Margaret Hamilton' },
    ],
    id: 'engineering',
    key: 'engineering',
    title: 'Engineering',
  },
  {
    data: [
      { id: 'c-1', name: 'Katherine Johnson' },
      { id: 'c-2', name: 'Radia Perlman' },
    ],
    id: 'science',
    key: 'science',
    title: 'Science',
  },
]

const ContactRow = memo(function ContactRow({ name }: ContactRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{name}</Text>
    </View>
  )
})

const ContactHeader = memo(function ContactHeader({
  id,
  title,
}: ContactHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
      <Text style={styles.subtleId}>{id}</Text>
    </View>
  )
})

export default function App() {
  const [sections, setSections] = useState<ContactSection[]>(BASE_SECTIONS)

  const reverseSectionOrder = useCallback(() => {
    setSections((prev) => [...prev].reverse())
  }, [])

  const keyExtractor = useCallback((item: Contact) => item.id, [])

  const renderItem = ({ item }: { item: Contact }) => (
    <ContactRow name={item.name} />
  )

  const renderSectionHeader = ({ section }: { section: ContactSection }) => (
    <ContactHeader id={section.id} title={section.title} />
  )

  return (
    <View style={styles.container}>
      <Pressable onPress={reverseSectionOrder} style={styles.button}>
        <Text style={styles.buttonText}>Reverse section order</Text>
      </Pressable>

      <SectionList
        keyExtractor={keyExtractor}
        sections={sections}
        stickySectionHeadersEnabled
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
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
