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
import { Button, StyleSheet, Text, View } from 'react-native'

interface NotesContextValue {
  notes: string[]
  addNote: (note: string) => void
}

const NotesContext = createContext<NotesContextValue>({
  notes: [],
  addNote: () => {},
})

function NotesProvider({ children }: PropsWithChildren) {
  const [notes] = useState<string[]>([])

  const addNote: NotesContextValue['addNote'] = () => {}

  return (
    <NotesContext.Provider value={{ notes, addNote }}>
      {children}
    </NotesContext.Provider>
  )
}

function NotesScreen() {
  const { notes } = useContext(NotesContext)

  const handleAddNote = () => {}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <Button title='Open' onPress={handleAddNote} />
      {notes.length === 0 ? (
        <Text>No notes yet</Text>
      ) : (
        notes.map((note) => <Text key={note}>{note}</Text>)
      )}
    </View>
  )
}

const Stack = createNativeStackNavigator({
  id: 'root',
  screens: {
    Notes: NotesScreen,
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
})
