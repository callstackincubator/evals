import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react'

import {
  createStaticNavigation,
  StaticParamList,
  useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

interface Notes {
  notes: string[]
  addNote: (note: string) => void
}

const NotesContext = createContext<Notes>({
  notes: [],
  addNote: () => {},
})

const NotesProvider = ({ children }: PropsWithChildren) => {
  const [notes, setNotes] = useState<string[]>([])

  const addNote: Notes['addNote'] = (note) => {
    setNotes((prevNotes) => [...prevNotes, note])
  }

  return (
    <NotesContext.Provider value={{ notes, addNote }}>
      {children}
    </NotesContext.Provider>
  )
}

function NotesScreen() {
  const navigation = useNavigation()
  const { notes } = useContext(NotesContext)

  const handleAddNote = () => {
    navigation.navigate('Compose')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <Button title="Open" onPress={handleAddNote} />
      {notes.length === 0 ? (
        <Text>No notes yet</Text>
      ) : (
        notes.map((note) => <Text key={note}>{note}</Text>)
      )}
    </View>
  )
}

function ComposeScreen() {
  const navigation = useNavigation()
  const [draft, setDraft] = useState('')
  const { addNote } = useContext(NotesContext)

  const onCancel = () => navigation.goBack()
  const onSave = () => {
    const nextNote = draft.trim()
    addNote(nextNote)
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="Type note"
      />
      <Button title="Cancel" onPress={onCancel} />
      <Button title="Save" onPress={onSave} />
    </View>
  )
}

const Stack = createNativeStackNavigator({
  screens: {
    Notes: NotesScreen,
    Compose: ComposeScreen,
  },
})

type RootStackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return (
    <NotesProvider>
      <Navigation />
    </NotesProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
})
