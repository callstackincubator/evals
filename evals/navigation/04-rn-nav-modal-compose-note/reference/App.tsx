import { useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

type RootStackParamList = {
  Notes: undefined
  Compose: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function NotesScreen({ navigation, notes }: { navigation: any; notes: string[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <Button title='Compose Note' onPress={() => navigation.navigate('Compose')} />
      {notes.length === 0 ? <Text>No notes yet</Text> : notes.map((note) => <Text key={note}>{note}</Text>)}
    </View>
  )
}

function ComposeScreen({ navigation, onSave }: { navigation: any; onSave: (note: string) => void }) {
  const [draft, setDraft] = useState('')

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={draft} onChangeText={setDraft} placeholder='Type note' />
      <Button title='Cancel' onPress={() => navigation.goBack()} />
      <Button
        title='Save'
        onPress={() => {
          const nextNote = draft.trim()
          if (nextNote) {
            onSave(nextNote)
          }
          navigation.goBack()
        }}
      />
    </View>
  )
}

export default function App() {
  const [notes, setNotes] = useState<string[]>([])

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Notes'>
          {(props) => <NotesScreen {...props} notes={notes} />}
        </Stack.Screen>
        <Stack.Screen name='Compose' options={{ presentation: 'modal', title: 'Compose' }}>
          {(props) => (
            <ComposeScreen
              {...props}
              onSave={(nextNote) => {
                setNotes((value) => [...value, nextNote])
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
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
