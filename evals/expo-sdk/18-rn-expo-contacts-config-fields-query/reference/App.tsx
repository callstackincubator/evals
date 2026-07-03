import * as Contacts from 'expo-contacts'
import { useState } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

type ContactRow = {
  id: string
  name: string
  email?: string
  imageUri?: string
}

export default function App() {
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const [denied, setDenied] = useState(false)

  const loadContacts = async () => {
    const permission = await Contacts.requestPermissionsAsync()
    if (!permission.granted) {
      setDenied(true)
      return
    }

    const result = await Contacts.Contact.getAllDetails(
      [
        Contacts.ContactField.FULL_NAME,
        Contacts.ContactField.EMAILS,
        Contacts.ContactField.IMAGE,
      ],
      { limit: 50 }
    )

    setContacts(
      result.map((contact) => ({
        id: contact.id,
        name: contact.fullName ?? 'Unnamed contact',
        email: contact.emails?.[0]?.address,
        imageUri: contact.image ?? undefined,
      }))
    )
    setLoaded(true)
  }

  if (denied) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>Contacts permission was denied.</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Contacts</Text>

      {!loaded ? (
        <Pressable style={styles.button} onPress={loadContacts}>
          <Text style={styles.buttonText}>Load contacts</Text>
        </Pressable>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.subtitle}>No contacts found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
              <View>
                <Text style={styles.name}>{item.name}</Text>
                {item.email ? (
                  <Text style={styles.email}>{item.email}</Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  avatarPlaceholder: {
    backgroundColor: '#cbd5e1',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  centered: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 8,
  },
  email: {
    color: '#6b7280',
  },
  name: {
    color: '#111827',
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    columnGap: 12,
    flexDirection: 'row',
    paddingVertical: 8,
  },
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    rowGap: 12,
  },
  subtitle: {
    color: '#6b7280',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
})
