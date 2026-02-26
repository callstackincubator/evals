import React, { useState } from 'react'

import {
  createStaticNavigation,
  useNavigation,
  usePreventRemove,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Edit: undefined
}

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>
type EditNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Edit'>

function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>()

  function handleEditProfile() {
    navigation.navigate('Edit')
  }

  return (
    <View style={styles.container}>
      <Button title='Open' onPress={handleEditProfile} />
    </View>
  )
}

function EditScreen() {
  const navigation = useNavigation<EditNavigationProp>()
  const [name, setName] = useState('')
  const [savedName, setSavedName] = useState('')

  const isDirty = name !== savedName

  usePreventRemove(isDirty, ({ data }) => {
    Alert.alert('Discard changes?', 'You have unsaved edits.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ])
  })

  function handleSave() {
    setSavedName(name)
  }

  function handleBack() {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder='Name' />
      <Button title='Save' onPress={handleSave} />
      <Button title='Back' onPress={handleBack} />
    </View>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>({
  screens: {
    Home: HomeScreen,
    Edit: EditScreen,
  },
})

const Navigation = createStaticNavigation(Stack)

export default function App() {
  return <Navigation />
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
