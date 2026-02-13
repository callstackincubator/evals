import { useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

type RootStackParamList = {
  Notes: undefined
  Compose: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function NotesScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <Button title='Compose Note' onPress={() => navigation.navigate('Compose')} />
    </View>
  )
}

function ComposeScreen({ navigation }: { navigation: any }) {
  const [draft, setDraft] = useState('')

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={draft} onChangeText={setDraft} placeholder='Type note' />
      <Button title='Cancel' onPress={() => navigation.goBack()} />
      <Button title='Save' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Notes' component={NotesScreen} />
        <Stack.Screen
          name='Compose'
          component={ComposeScreen}
          options={{ presentation: 'modal', title: 'Compose' }}
        />
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
