import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const CONTACTS = [
  { id: 'contact-1', name: 'Alicia Stone', role: 'Design' },
  { id: 'contact-2', name: 'Brandon White', role: 'Support' },
  { id: 'contact-3', name: 'Carmen Ford', role: 'Engineering' },
  { id: 'contact-4', name: 'Diego Park', role: 'Finance' },
  { id: 'contact-5', name: 'Elena Hall', role: 'Operations' },
]

export default function App() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={CONTACTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>{item.role}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
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
})
