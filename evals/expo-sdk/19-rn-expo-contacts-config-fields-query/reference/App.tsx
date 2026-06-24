import * as Contacts from 'expo-contacts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [contacts, setContacts] = useState<
    Array<{ fullName?: string | null; id: string }>
  >([])
  const [message, setMessage] = useState('Contacts not loaded.')

  const load = async () => {
    const permission = await Contacts.requestPermissionsAsync()
    if (!permission.granted) {
      setMessage('Contacts permission denied.')
      return
    }
    const result = await Contacts.Contact.getAllDetails(
      [
        Contacts.ContactField.FULL_NAME,
        Contacts.ContactField.EMAILS,
        Contacts.ContactField.IMAGE,
      ],
      { limit: 20 }
    )
    setContacts(result.map((contact) => ({
      fullName: contact.fullName,
      id: contact.id,
    })))
    setMessage(result.length ? 'Contacts loaded.' : 'No contacts available.')
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Contacts</Text>
      <Text style={styles.subtitle}>{message}</Text>
      {contacts.map((contact) => <Text key={contact.id} style={styles.subtitle}>{contact.fullName ?? 'Unnamed contact'}</Text>)}
      <Pressable onPress={load} style={styles.action}><Text style={styles.actionText}>Load contacts</Text></Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  media: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#4b5563',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
