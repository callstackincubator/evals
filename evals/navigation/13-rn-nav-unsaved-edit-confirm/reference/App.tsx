import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Button title='Edit profile' onPress={() => navigation.navigate('Edit')} />
    </View>
  )
}

function EditScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('')
  const [savedName, setSavedName] = useState('')

  const isDirty = name !== savedName

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (!isDirty) {
        return
      }

      event.preventDefault()
      Alert.alert('Discard changes?', 'You have unsaved edits.', [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => navigation.dispatch(event.data.action),
        },
      ])
    })

    return unsubscribe
  }, [isDirty, navigation])

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder='Name' />
      <Button title='Save' onPress={() => setSavedName(name)} />
      <Button title='Back' onPress={() => navigation.goBack()} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Edit' component={EditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
  },
})
