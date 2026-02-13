import { useState } from 'react'

import {
  NavigationContainer,
  useNavigation,
  usePreventRemove,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

const Stack = createNativeStackNavigator()

function HomeScreen() {
  const navigation = useNavigation()

  const handleOpenEdit = () => {
    navigation.navigate('Edit')
  }

  return (
    <View style={styles.centered}>
      <Button title="Open edit flow" onPress={handleOpenEdit} />
    </View>
  )
}

function EditScreen() {
  const navigation = useNavigation()
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState('')
  const dirty = value !== saved

  usePreventRemove(dirty, ({ data }) => {
    if (Platform.OS === 'web') {
      const discard = confirm(
        'You have unsaved changes. Discard them and leave the screen?'
      )
      if (discard) {
        navigation.dispatch(data.action)
      }
    } else {
      Alert.alert('Leave without saving?', 'This edit has unsaved changes.', [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ])
    }
  })

  const handleSave = () => {
    setSaved(value)
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.form}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Edit text"
        style={styles.input}
      />
      <Button title="Save" onPress={handleSave} />
      <Button title="Go back" onPress={handleGoBack} />
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Edit" component={EditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    padding: 10,
  },
})
