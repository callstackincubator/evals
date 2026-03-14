import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

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
      <Text style={styles.title}>Contacts</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
})
