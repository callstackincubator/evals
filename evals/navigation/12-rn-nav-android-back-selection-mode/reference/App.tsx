import React, { useState } from 'react'

import {
  createStaticNavigation,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack'
import { BackHandler, Button, StyleSheet, Text, View } from 'react-native'

type RootStackParamList = {
  Home: undefined
  SelectableList: undefined
}

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>()

  function handleOpenList() {
    navigation.navigate('SelectableList')
  }

  return (
    <View style={styles.container}>
      <Button title="Open" onPress={handleOpenList} />
    </View>
  )
}

function SelectableListScreen() {
  const [selectionMode, setSelectionMode] = useState(false)

  function handleToggleSelectionMode() {
    setSelectionMode((value) => !value)
  }

  useFocusEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (selectionMode) {
          setSelectionMode(false)
          return true
        }

        return false
      }
    )

    return () => {
      subscription.remove()
    }
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`Selection mode ${selectionMode ? 'ON' : 'OFF'}`}</Text>
      <Button
        title={`${selectionMode ? 'Disable' : 'Enable'} selection mode`}
        onPress={handleToggleSelectionMode}
      />
      <Text>
        Press Android back to exit selection mode before leaving screen.
      </Text>
    </View>
  )
}

const Stack = createNativeStackNavigator<RootStackParamList>({
  screens: {
    Home: HomeScreen,
    SelectableList: SelectableListScreen,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
})
