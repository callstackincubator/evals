import React from 'react'
import {
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const CONTACTS = [
  { id: 'contact-1', name: 'Alicia Stone', role: 'Design' },
  { id: 'contact-2', name: 'Brandon White', role: 'Support' },
  { id: 'contact-3', name: 'Bianca Flores', role: 'Finance' },
  { id: 'contact-4', name: 'Carmen Ford', role: 'Engineering' },
  { id: 'contact-5', name: 'Diego Park', role: 'Operations' },
  { id: 'contact-6', name: 'Elena Hall', role: 'Support' },
]

const sections = [...CONTACTS]
  .sort((a, b) => a.name.localeCompare(b.name))
  .reduce<
    Array<{
      title: string
      data: typeof CONTACTS
    }>
  >((allSections, contact) => {
    const title = contact.name[0].toUpperCase()
    const lastSection = allSections[allSections.length - 1]

    if (!lastSection || lastSection.title !== title) {
      allSections.push({
        data: [contact],
        title,
      })
    } else {
      lastSection.data.push(contact)
    }

    return allSections
  }, [])

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Contacts</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>{item.role}</Text>
            </View>
          )
        }}
        renderSectionHeader={({ section }) => {
          return <Text style={styles.header}>{section.title}</Text>
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  name: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  role: {
    color: '#475569',
    marginTop: 4,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
  },
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
})
