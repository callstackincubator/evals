import { ScrollView, StyleSheet, Text, View } from 'react-native'

type ContactRow = {
  id: string
  name: string
  team: string
}

const CONTACTS: ContactRow[] = [
  { id: 'c-1', name: 'Maya Chen', team: 'Support' },
  { id: 'c-2', name: 'Noah Patel', team: 'Logistics' },
  { id: 'c-3', name: 'Avery Kim', team: 'Partnerships' },
  { id: 'c-4', name: 'Sofia Rivera', team: 'Operations' },
  { id: 'c-5', name: 'Liam Brooks', team: 'Customer Success' },
  { id: 'c-6', name: 'Emma Davis', team: 'Field Team' },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Contacts</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {CONTACTS.map((contact) => (
          <View key={contact.id} style={styles.row}>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.meta}>{contact.team}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  meta: {
    color: '#475569',
    fontSize: 13,
    marginTop: 4,
  },
  name: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  screen: {
    backgroundColor: '#eef2ff',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
})
