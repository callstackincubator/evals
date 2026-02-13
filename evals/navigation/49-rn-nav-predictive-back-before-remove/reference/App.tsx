import { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Alert, Button, TextInput, View } from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title='Open edit flow' onPress={() => navigation.navigate('Edit')} />
    </View>
  )
}

function EditScreen({ navigation }: { navigation: any }) {
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState('')
  const dirty = value !== saved

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (!dirty) {
        return
      }

      event.preventDefault()
      Alert.alert('Leave without saving?', 'This edit has unsaved changes.', [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => navigation.dispatch(event.data.action),
        },
      ])
    })

    return unsubscribe
  }, [dirty, navigation])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
      <TextInput value={value} onChangeText={setValue} placeholder='Edit text' style={{ width: '100%', borderWidth: 1, padding: 10 }} />
      <Button title='Save' onPress={() => setSaved(value)} />
      <Button title='Go back' onPress={() => navigation.goBack()} />
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
